import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(backendDirectory, '.env');

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Run this setup command in an interactive terminal.');
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolveValue, reject) => {
    let value = '';
    const onData = (character) => {
      if (character === '\u0003') {
        cleanup();
        reject(new Error('Credential setup cancelled.'));
      } else if (character === '\r' || character === '\n') {
        cleanup();
        stdout.write('\n');
        resolveValue(value);
      } else if (character === '\u007f' || character === '\b') {
        value = value.slice(0, -1);
      } else if (!character.startsWith('\u001b')) {
        value += character;
      }
    };
    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
    };
    stdin.on('data', onData);
  });
}

function setEnvValue(contents, key, value) {
  const lines = contents.split(/\r?\n/).filter((line) => !line.startsWith(`${key}=`));
  lines.push(`${key}=${value}`);
  return lines.filter(Boolean).join('\n');
}

async function main() {
  const readline = createInterface({ input: stdin, output: stdout });
  const email = (await readline.question('Login email: ')).trim().toLowerCase();
  readline.close();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');

  const password = await readHidden('Login password (input hidden): ');
  if (password.length < 8) throw new Error('Choose a password with at least 8 characters.');
  const hash = await bcrypt.hash(password, 12);

  let contents;
  try {
    contents = await readFile(envPath, 'utf8');
  } catch {
    contents = await readFile(resolve(backendDirectory, '.env.example'), 'utf8');
  }
  contents = setEnvValue(contents, 'EXAM_EMAIL', email);
  contents = setEnvValue(contents, 'EXAM_PASSWORD_HASH', hash);
  await writeFile(envPath, `${contents}\n`, { mode: 0o600 });
  console.log('Login email and password hash saved to backend/.env. Plaintext password was not saved.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});