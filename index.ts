#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import { cyan, green, red, yellow, bold, blue } from 'picocolors';
import Commander from 'commander';
import Conf from 'conf';
import path from 'path';
import prompts from 'prompts';
import checkForUpdate from 'update-check';
import { createApp, DownloadError } from './create-app';
import { validateNpmName } from './helpers/validate-pkg';
import packageJson from './package.json';
import { isFolderEmpty } from './helpers/is-folder-empty';
import fs from 'fs';

let projectPath: string = '';

const handleSigTerm = () => process.exit(0);

process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${green('<project-directory>')} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    '--ts, --typescript',
    `

  Initialize as a TypeScript project. (default)
`,
  )
  .option(
    '--js, --javascript',
    `

  Initialize as a JavaScript project.
`,
  )
  .option(
    '--eslint',
    `

  Initialize with eslint config.
`,
  )
  .option(
    '--app',
    `

  Initialize as an App Router project.
`,
  )
  .option(
    '--src-dir',
    `

  Initialize inside a \`src/\` directory.
`,
  )
  .option(
    '--import-alias <alias-to-configure>',
    `

  Specify import alias to use (default "@/*").
`,
  )
  .option(
    '--use-npm',
    `

  Explicitly tell the CLI to bootstrap the application using npm
`,
  )
  .option(
    '--use-pnpm',
    `

  Explicitly tell the CLI to bootstrap the application using pnpm
`,
  )
  .option(
    '--use-yarn',
    `

  Explicitly tell the CLI to bootstrap the application using Yarn
`,
  )
  .option(
    '--use-bun',
    `

  Explicitly tell the CLI to bootstrap the application using Bun
`,
  )
  .option(
    '-e, --example [name]|[github-url]',
    `

  An example to bootstrap the app with. You can use an example name
  from the official Next.js repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`,
  )
  .option(
    '--example-path <path-to-example>',
    `

  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`,
  )
  .option(
    '--reset-preferences',
    `

  Explicitly tell the CLI to reset any stored preferences
`,
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = 'yarn';

async function run(): Promise<void> {
  const conf = new Conf({ projectName: 'create-cko-mfa' });

  if (program.resetPreferences) {
    conf.clear();
    console.log(`Preferences reset successfully`);
    return;
  }

  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'my-app',
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return 'Invalid project name: ' + validation.problems![0];
      },
    });

    if (typeof res.path === 'string') {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      '\nPlease specify the project directory:\n' +
        `  ${cyan(program.name())} ${green('<project-directory>')}\n` +
        'For example:\n' +
        `  ${cyan(program.name())} ${green('my-next-app')}\n\n` +
        `Run ${cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${red(
        `"${projectName}"`,
      )} because of npm naming restrictions:`,
    );

    problems!.forEach((p) => console.error(`    ${red(bold('*'))} ${p}`));
    process.exit(1);
  }

  if (program.example === true) {
    console.error('Please provide an example name or url, otherwise remove the example option.');
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const example = typeof program.example === 'string' && program.example.trim();
  const preferences = (conf.get('preferences') || {}) as Record<string, boolean | string>;
  /**
   * If the user does not provide the necessary flags, prompt them for whether
   * to use TS or JS.
   */
  if (!example) {
    const defaults: typeof preferences = {
      typescript: true,
      eslint: true,
      app: true,
      srcDir: false,
      importAlias: '@/*',
      customizeImportAlias: false,
    };
    const getPrefOrDefault = (field: string) => preferences[field] ?? defaults[field];

    program.typescript = true;
    program.javascript = false;
    preferences.typescript = true;
    program.eslint = false;
    preferences.eslint = false;
  }

  try {
    await createApp({
      appPath: resolvedProjectPath,
      example: example && example !== 'default' ? example : undefined,
      examplePath: program.examplePath,
      typescript: program.typescript,
      eslint: false,
      appRouter: false,
      srcDir: false,
      importAlias: '@/*',
    });
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason;
    }

    const res = await prompts({
      onState: onPromptState,
      type: 'confirm',
      name: 'builtin',
      message:
        `Could not download "${example}" because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template instead?`,
      initial: true,
    });
    if (!res.builtin) {
      throw reason;
    }

    await createApp({
      appPath: resolvedProjectPath,
      typescript: program.typescript,
      eslint: program.eslint,
      appRouter: false,
      srcDir: false,
      importAlias: '@/*',
    });
  }
  conf.set('preferences', preferences);
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage = 'yarn global add create-cko-mfa';

      console.log(
        yellow(bold('A new version of `create-cko-mfa` is available!')) +
          '\n' +
          'You can update by running: ' +
          cyan(updateMessage) +
          '\n',
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log('Aborting installation.');
    if (reason.command) {
      console.log(`  ${cyan(reason.command)} has failed.`);
    } else {
      console.log(red('Unexpected error. Please report it as a bug:') + '\n', reason);
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
