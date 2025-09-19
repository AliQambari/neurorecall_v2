import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg({ log: false });

export async function ConvertWebmToWav(webmBlob) {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  const inputName = 'input.webm';
  const outputName = 'output.wav';

  await ffmpeg.writeFile(inputName, await fetchFile(webmBlob));
  await ffmpeg.exec(['-i', inputName, outputName]);
  const data = await ffmpeg.readFile(outputName);

  return new Blob([data.buffer], { type: 'audio/wav' });
}
