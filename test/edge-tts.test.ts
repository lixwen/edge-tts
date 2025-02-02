import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { EdgeTTS } from "../src";

describe("EdgeTTS", () => {
  let tts: EdgeTTS;

  beforeAll(() => {
    tts = new EdgeTTS();
  });

  afterAll(() => {
  });

  test("should get available voices", async () => {
    const voices = await tts.getVoices();
    expect(Array.isArray(voices)).toBe(true);
    expect(voices.length).toBeGreaterThan(0);
  });

  test("should synthesize text", async () => {
    const text = "原来的写法 await expect(await tts.toFile(filePath)).resolves.not.toThrow() 是错误的，因为我们已经用 await 等待了 toFile 的结果，这时候得到的就是 void，而不是 Promise";
    const voice = "zh-CN-XiaoxiaoNeural";
    await tts.synthesize(text, voice, {
      rate: '0%',
      volume: '0%',
      pitch: '0Hz'
    }).then(() => {
      console.log('synthesize done');
    }).catch((err) => {
      console.log('synthesize error: ', err);
    });
    
    // 测试不同的输出格式
    const base64Output = tts.toBase64();
    expect(base64Output).toBeDefined();

    const rawOutput = await tts.toRaw();
    expect(rawOutput).toBeDefined();
    
    // 测试文件输出
    const filePath = "/Users/lixen/code/electron/output/test_output";
    await expect(tts.toFile(filePath)).resolves.toBeUndefined();
  });

  test("should handle invalid voice", async () => {
    const invalidVoice = "invalid-voice";
    await expect(
      tts.synthesize("test", invalidVoice)
    ).rejects.toThrow();
  });

  test("should handle invalid parameters", async () => {
    await expect(
      tts.synthesize("test", "zh-CN-XiaoxiaoNeural", {
        rate: '200%' // 超出范围的值
      })
    ).rejects.toThrow();
  });
}); 