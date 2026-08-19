<#
.SYNOPSIS
    Extrai, verifica e publica a Fabrica Agentica de Landing Pages (lp-factory) no Windows.

.DESCRIPTION
    Faz, em ordem, parando no primeiro erro:
      1. Pre-voo: confere git, Node, npm e (opcionalmente) o GitHub CLI.
      2. Localiza e extrai o lp-factory.zip.
      3. Verifica a integridade da fabrica rodando a suite de gates.
      4. Inicializa o repositorio git com os fins de linha corretos.
      5. Cria o repositorio no GitHub e da push.

    Nada e sobrescrito sem -Forcar. Se algo falhar, o script diz exatamente o que fazer
    e nao continua fingindo que deu certo.

.PARAMETER Zip
    Caminho do lp-factory.zip. Se omitido, procura o mais recente em Downloads.

.PARAMETER Destino
    Pasta onde a fabrica sera instalada. Padrao: %USERPROFILE%\lp-factory

.PARAMETER Repo
    Nome do repositorio no GitHub. Padrao: lp-factory

.PARAMETER Visibilidade
    private (padrao) ou public.

.PARAMETER PularGitHub
    Faz o setup local e para antes de publicar.

.PARAMETER InstalarTemplate
    Tambem instala as dependencias do template Astro (mais lento, deixa pronto para buildar).

.PARAMETER Forcar
    Permite sobrescrever uma pasta de destino que ja exista.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1 -Repo fabrica-lp -Visibilidade public -InstalarTemplate

.NOTES
    Requer PowerShell 5.1 ou superior, Node 20.19+ (recomendado 22) e git.
    O GitHub CLI (gh) e opcional: sem ele, o script deixa o commit pronto e mostra os
    comandos exatos para publicar a mao.
#>

#Requires -Version 5.1
[CmdletBinding()]
param(
    [string] $Zip,
    [string] $Destino,
    [string] $Repo = 'lp-factory',
    [ValidateSet('private', 'public')]
    [string] $Visibilidade = 'private',
    [switch] $PularGitHub,
    [switch] $InstalarTemplate,
    [switch] $Forcar
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

# ------------------------------------------------------------------ saida

$script:Passo = 0

function Write-Passo([string] $Texto) {
    $script:Passo++
    Write-Host ''
    Write-Host ("[{0}] {1}" -f $script:Passo, $Texto) -ForegroundColor Cyan
    Write-Host ('-' * 62) -ForegroundColor DarkGray
}

function Write-Ok([string] $Texto)    { Write-Host "  ok    $Texto" -ForegroundColor Green }
function Write-Info([string] $Texto)  { Write-Host "        $Texto" -ForegroundColor Gray }
function Write-Aviso([string] $Texto) { Write-Host "  aviso $Texto" -ForegroundColor Yellow }

function Stop-Com([string] $Motivo, [string[]] $ComoResolver) {
    Write-Host ''
    Write-Host "FALHOU: $Motivo" -ForegroundColor Red
    if ($ComoResolver) {
        Write-Host ''
        Write-Host 'Como resolver:' -ForegroundColor Yellow
        foreach ($linha in $ComoResolver) { Write-Host "  - $linha" }
    }
    Write-Host ''
    exit 1
}

function Test-Comando([string] $Nome) {
    $null -ne (Get-Command $Nome -ErrorAction SilentlyContinue)
}

function Invoke-Externo {
    param(
        [Parameter(Mandatory)] [string]   $Arquivo,
        [Parameter(Mandatory)] [string[]] $Argumentos,
        [string] $EmCasoDeErro
    )
    & $Arquivo @Argumentos
    if ($LASTEXITCODE -ne 0) {
        $cmd = "$Arquivo $($Argumentos -join ' ')"
        if (-not $EmCasoDeErro) { $EmCasoDeErro = "O comando terminou com codigo $LASTEXITCODE." }
        Stop-Com "$cmd" @($EmCasoDeErro)
    }
}

Write-Host ''
Write-Host '  Fabrica Agentica de Landing Pages - setup para Windows' -ForegroundColor White
Write-Host '  ------------------------------------------------------' -ForegroundColor DarkGray

# ------------------------------------------------------- 1. pre-voo

Write-Passo 'Pre-voo: verificando o que a fabrica precisa'

if (-not (Test-Comando 'git')) {
    Stop-Com 'git nao encontrado no PATH.' @(
        'Instale com: winget install --id Git.Git -e',
        'Depois FECHE e reabra o PowerShell, para o PATH ser recarregado.'
    )
}
Write-Ok ("git       $((git --version) -replace 'git version ', '')")

if (-not (Test-Comando 'node')) {
    Stop-Com 'Node.js nao encontrado no PATH.' @(
        'Instale a versao LTS com: winget install --id OpenJS.NodeJS.LTS -e',
        'Depois FECHE e reabra o PowerShell.'
    )
}

$versaoNode  = (node --version).TrimStart('v')
$partesNode  = $versaoNode -split '\.'
$maiorNode   = [int] $partesNode[0]
$menorNode   = [int] $partesNode[1]

if ($maiorNode -lt 20 -or ($maiorNode -eq 20 -and $menorNode -lt 19)) {
    Stop-Com "Node $versaoNode e antigo demais. O template Astro 7 exige 20.19 ou superior." @(
        'Atualize com: winget upgrade --id OpenJS.NodeJS.LTS -e',
        'A versao 22 LTS e a recomendada para esta fabrica.'
    )
}
if ($maiorNode -lt 22) {
    Write-Aviso "Node $versaoNode funciona, mas a fabrica foi construida e testada no Node 22."
} else {
    Write-Ok "node      v$versaoNode"
}

if (-not (Test-Comando 'npm')) {
    Stop-Com 'npm nao encontrado, apesar do Node estar instalado.' @(
        'Reinstale o Node.js: winget install --id OpenJS.NodeJS.LTS -e --force'
    )
}
Write-Ok ("npm       $(npm --version)")

$temGh    = Test-Comando 'gh'
$ghLogado = $false

if ($temGh) {
    gh auth status *> $null
    $ghLogado = ($LASTEXITCODE -eq 0)
    if ($ghLogado) {
        Write-Ok 'gh        instalado e autenticado'
    } else {
        Write-Aviso 'gh instalado, mas sem login. Rode: gh auth login'
    }
} else {
    Write-Aviso 'GitHub CLI (gh) ausente. O setup local roda normalmente; a publicacao ficara manual.'
    Write-Info 'Para automatizar: winget install --id GitHub.cli -e'
}

# --------------------------------------------------- 2. localizar o zip

Write-Passo 'Localizando o pacote da fabrica'

if (-not $Zip) {
    $pastasBusca = @(
        (Join-Path $HOME 'Downloads'),
        (Join-Path $HOME 'Desktop'),
        (Get-Location).Path
    ) | Where-Object { Test-Path $_ }

    $candidato = Get-ChildItem -Path $pastasBusca -Filter 'lp-factory*.zip' -File -ErrorAction SilentlyContinue |
                 Sort-Object LastWriteTime -Descending |
                 Select-Object -First 1

    if (-not $candidato) {
        Stop-Com 'Nao encontrei nenhum lp-factory*.zip em Downloads, Desktop ou na pasta atual.' @(
            'Passe o caminho explicitamente: .\setup-windows.ps1 -Zip "C:\caminho\lp-factory.zip"'
        )
    }
    $Zip = $candidato.FullName
}

if (-not (Test-Path -LiteralPath $Zip)) {
    Stop-Com "O arquivo informado nao existe: $Zip" @('Confira o caminho e tente de novo.')
}

$infoZip = Get-Item -LiteralPath $Zip
Write-Ok "pacote    $($infoZip.Name)  ($([math]::Round($infoZip.Length / 1MB, 2)) MB)"
Write-Info "origem    $($infoZip.DirectoryName)"

# ------------------------------------------------------- 3. extrair

Write-Passo 'Extraindo a fabrica'

if (-not $Destino) { $Destino = Join-Path $HOME 'lp-factory' }

if (Test-Path -LiteralPath $Destino) {
    $vazia = -not (Get-ChildItem -LiteralPath $Destino -Force -ErrorAction SilentlyContinue)
    if (-not $vazia -and -not $Forcar) {
        Stop-Com "A pasta de destino ja existe e nao esta vazia: $Destino" @(
            'Escolha outro destino: -Destino "C:\dev\lp-factory"',
            'Ou sobrescreva conscientemente: -Forcar',
            'Se ali ja existe uma fabrica com trabalho seu, faca backup antes.'
        )
    }
    if (-not $vazia) {
        Write-Aviso 'Destino existente sera substituido (-Forcar).'
        Remove-Item -LiteralPath $Destino -Recurse -Force
    }
}

$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("lp-factory-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $temp -Force | Out-Null

try {
    Expand-Archive -LiteralPath $Zip -DestinationPath $temp -Force

    # O zip pode ou nao ter uma pasta raiz lp-factory/. Os dois casos funcionam.
    $raiz = $temp
    $itens = Get-ChildItem -LiteralPath $temp -Force
    if ($itens.Count -eq 1 -and $itens[0].PSIsContainer) { $raiz = $itens[0].FullName }

    if (-not (Test-Path (Join-Path $raiz 'plugin'))) {
        Stop-Com 'O zip nao parece ser a fabrica: nao encontrei a pasta plugin/ dentro dele.' @(
            'Confirme que voce baixou o lp-factory.zip completo, e nao um arquivo parcial.'
        )
    }

    $paiDestino = Split-Path -Parent $Destino
    if ($paiDestino -and -not (Test-Path $paiDestino)) {
        New-Item -ItemType Directory -Path $paiDestino -Force | Out-Null
    }
    Move-Item -LiteralPath $raiz -Destination $Destino -Force
} finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue }
}

Set-Location -LiteralPath $Destino
Write-Ok "instalada em  $Destino"

$obrigatorios = @('CLAUDE.md', 'PROJECT.md', 'POLITICA_ANTI_SLOP.md', '.claude\agents', 'plugin\scripts', 'templates\base')
$faltando = $obrigatorios | Where-Object { -not (Test-Path (Join-Path $Destino $_)) }
if ($faltando) {
    Stop-Com "A fabrica esta incompleta. Faltam: $($faltando -join ', ')" @(
        'Baixe o pacote novamente; a extracao anterior pode ter sido interrompida.'
    )
}

$qtdAgentes = (Get-ChildItem (Join-Path $Destino '.claude\agents') -Filter '*.md' -File).Count
$qtdBlocos  = @(Get-ChildItem (Join-Path $Destino 'templates\blocks') -Directory -ErrorAction SilentlyContinue).Count
Write-Ok "$qtdAgentes subagents, $qtdBlocos blocos na biblioteca"

# ------------------------------------------- 4. verificar os gates

Write-Passo 'Verificando a fabrica: rodando a suite de gates'
Write-Info 'Isto prova que o que deve reprovar reprova, nesta maquina.'

$saidaSuite = & node (Join-Path $Destino 'plugin\scripts\selftest.mjs') 2>&1
$codigoSuite = $LASTEXITCODE

$resumo = $saidaSuite | Select-String -Pattern 'passaram' | Select-Object -Last 1
$falhas = $saidaSuite | Select-String -Pattern '^FAIL'

if ($codigoSuite -ne 0) {
    Write-Host ''
    foreach ($f in $falhas) { Write-Host "  $f" -ForegroundColor Red }
    Stop-Com 'A suite de gates falhou nesta maquina.' @(
        'Rode manualmente para ver o detalhe: node plugin\scripts\selftest.mjs',
        'Causa mais comum: versao de Node antiga. Confira com: node --version'
    )
}
Write-Ok ("suite     " + ("$resumo" -replace '\s+', ' ').Trim())

if ($InstalarTemplate) {
    Write-Passo 'Instalando as dependencias do template Astro'
    Write-Info 'Uma vez so; os clientes novos reaproveitam.'
    Push-Location (Join-Path $Destino 'templates\base')
    try {
        Invoke-Externo -Arquivo 'npm' -Argumentos @('install', '--no-audit', '--no-fund') `
            -EmCasoDeErro 'Verifique sua conexao e se algum proxy corporativo bloqueia o registro do npm.'
        Write-Ok 'template pronto para buildar'
    } finally {
        Pop-Location
    }
}

# -------------------------------------------------- 5. repositorio git

Write-Passo 'Preparando o repositorio git'

$jaEraRepo = Test-Path (Join-Path $Destino '.git')

if ($jaEraRepo) {
    Write-Info 'Ja existe um repositorio aqui; mantendo o historico.'
} else {
    git init --quiet 2>&1 | Out-Null
    git symbolic-ref HEAD refs/heads/main 2>&1 | Out-Null
    Write-Ok 'repositorio iniciado na branch main'
}

$nomeGit  = git config user.name  2>$null
$emailGit = git config user.email 2>$null

if (-not $nomeGit -or -not $emailGit) {
    Write-Aviso 'git sem nome/e-mail configurados. Definindo apenas para este repositorio.'
    if (-not $nomeGit)  { git config user.name  $env:USERNAME | Out-Null }
    if (-not $emailGit) { git config user.email "$env:USERNAME@users.noreply.github.com" | Out-Null }
    Write-Info 'Para usar sua identidade real: git config --global user.email "voce@exemplo.com"'
}

# O .gitattributes do repositorio normaliza os fins de linha; sem isto o Windows
# commitaria CRLF e os scripts chegariam quebrados em qualquer maquina Unix e no CI.
git add -A 2>&1 | Out-Null

$temMudanca = (git status --porcelain)
if ($temMudanca) {
    git commit -q -m "chore: setup da fabrica de landing pages no Windows" 2>&1 | Out-Null
    Write-Ok "commit criado ($(@($temMudanca).Count) arquivo(s))"
} else {
    Write-Info 'Nada novo para commitar.'
}

# ------------------------------------------------------ 6. publicar

if ($PularGitHub) {
    Write-Passo 'Publicacao pulada (-PularGitHub)'
    Write-Info 'A fabrica esta pronta localmente.'
} elseif (-not $ghLogado) {
    Write-Passo 'Publicacao no GitHub: manual'
    if (-not $temGh) {
        Write-Aviso 'gh nao esta instalado, entao nao posso criar o repositorio por voce.'
    } else {
        Write-Aviso 'gh instalado, mas sem login.'
    }
    Write-Host ''
    Write-Host '  Rode estes tres comandos nesta pasta:' -ForegroundColor Yellow
    Write-Host ''
    if (-not $temGh) { Write-Host '    winget install --id GitHub.cli -e' }
    Write-Host '    gh auth login'
    Write-Host ("    gh repo create {0} --{1} --source . --remote origin --push" -f $Repo, $Visibilidade)
    Write-Host ''
    Write-Host '  Ou, se preferir criar o repositorio pelo site do GitHub:' -ForegroundColor Yellow
    Write-Host ''
    Write-Host ('    git remote add origin https://github.com/SEU-USUARIO/{0}.git' -f $Repo)
    Write-Host '    git push -u origin main'
} else {
    Write-Passo 'Publicando no GitHub'

    $usuario = gh api user --jq .login 2>$null
    $existe  = $false
    if ($usuario) {
        gh repo view "$usuario/$Repo" *> $null
        $existe = ($LASTEXITCODE -eq 0)
    }

    if ($existe) {
        Write-Aviso "O repositorio $usuario/$Repo ja existe na sua conta."
        Write-Info 'Vinculando a ele e dando push, em vez de criar outro.'

        $temOrigin = (git remote) -contains 'origin'
        if (-not $temOrigin) {
            git remote add origin "https://github.com/$usuario/$Repo.git" | Out-Null
        }
        Invoke-Externo -Arquivo 'git' -Argumentos @('push', '-u', 'origin', 'main') `
            -EmCasoDeErro 'Se o repositorio remoto ja tem commits, resolva o conflito antes: git pull --rebase origin main'
    } else {
        Invoke-Externo -Arquivo 'gh' -Argumentos @('repo', 'create', $Repo, "--$Visibilidade", '--source', '.', '--remote', 'origin', '--push') `
            -EmCasoDeErro 'Confira se voce tem permissao para criar repositorios nesta conta.'
    }

    $url = gh repo view --json url --jq .url 2>$null
    if ($url) { Write-Ok "publicado em  $url" }
}

# ------------------------------------------------------ encerramento

Write-Host ''
Write-Host '  Pronto.' -ForegroundColor Green
Write-Host '  ------------------------------------------------------' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Proximos passos, nesta pasta:' -ForegroundColor White
Write-Host ''
Write-Host '    claude'
Write-Host '    /plugin marketplace add .'
Write-Host '    /plugin install lp-factory@lp-factory-marketplace'
Write-Host ''
Write-Host '    /lp-intake        abre um cliente e fixa o nivel'
Write-Host '    /lp-cycle <slug>  roda os tres ciclos com o gate entre eles'
Write-Host ''
Write-Host '  Para a rotina diaria das 23h funcionar, adicione nos segredos do repositorio:' -ForegroundColor White
Write-Host '    ANTHROPIC_API_KEY      obrigatorio'
Write-Host '    VITALS_DATABASE_URL    opcional; sem ele a manutencao nao ve Web Vitals de campo'
Write-Host ''
Write-Host "  Pasta: $Destino" -ForegroundColor Gray
Write-Host ''
