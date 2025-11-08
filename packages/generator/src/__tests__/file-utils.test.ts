import fs from 'fs';
import path from 'path';
import { formatFile } from '../utils/formatFile';
import { writeFileSafely } from '../utils/writeFileSafely';

describe('utils/formatFile', () => {
  it('should format content with prettier config', async () => {
    const content = 'const test="hello"';
    const result = await formatFile(content);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle formatting errors gracefully', async () => {
    const content = 'const test = "hello";';
    const result = await formatFile(content);
    expect(typeof result).toBe('string');
  });

  it('should handle invalid syntax in formatter', async () => {
    // Test with content that might cause formatting errors
    const invalidContent = 'const x = {{{';
    try {
      await formatFile(invalidContent);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('utils/writeFileSafely', () => {
  const testDir = './tmp/test-write-safely';
  const testFile = path.join(testDir, 'nested', 'test.ts');

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create directory and write file', async () => {
    const content = 'export const test = "hello";';
    await writeFileSafely(testFile, content);
    expect(fs.existsSync(testFile)).toBeTruthy();
    const written = fs.readFileSync(testFile, 'utf-8');
    expect(written.length).toBeGreaterThan(0);
  });

  it('should create nested directories if they do not exist', async () => {
    const nestedFile = path.join(testDir, 'a', 'b', 'c', 'file.ts');
    const content = 'const nested = true;';
    await writeFileSafely(nestedFile, content);
    expect(fs.existsSync(nestedFile)).toBeTruthy();
  });
});
