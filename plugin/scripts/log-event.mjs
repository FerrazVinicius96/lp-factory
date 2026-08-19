#!/usr/bin/env node
/**
 * Escrita determinística de log a partir de um hook. O modelo nunca escreve log a mao.
 * Uso em hooks: ... | node log-event.mjs <evento>
 * Le o payload do hook na stdin e grava uma linha em clients/<slug>/logs/<evento>.jsonl
 */
import { readHookInput, slugFromPath, logEvent } from './lib.mjs';

const ev = process.argv[2] || 'event';
const hook = await readHookInput();

const caminho =
  hook?.tool_input?.file_path ||
  hook?.tool_input?.command ||
  hook?.cwd ||
  '';

const slug = slugFromPath(caminho) || slugFromPath(hook?.cwd) || process.env.LP_SLUG;
if (!slug) process.exit(0);

const linha = { ev };

if (hook.hook_event_name) linha.hook = hook.hook_event_name;
if (hook.tool_name) linha.tool = hook.tool_name;
if (hook.agent_type) linha.agente = hook.agent_type;

if (hook?.tool_input?.file_path) {
  linha.arquivo = String(hook.tool_input.file_path).split('/clients/')[1] || hook.tool_input.file_path;
}
if (hook?.tool_input?.command) {
  linha.cmd = String(hook.tool_input.command).slice(0, 160);
}

logEvent(slug, linha);
process.exit(0);
