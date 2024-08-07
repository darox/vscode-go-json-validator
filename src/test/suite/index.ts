import * as path from 'path';
import Mocha from 'mocha';
import globDefault from 'glob';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err: Error | null, files: string[]) => {
      if (err) {
        return reject(err);
      }

      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
function glob(arg0: string, arg1: { cwd: string; }, arg2: (err: Error | null, files: string[]) => void) {
  throw new Error('Function not implemented.');
}

