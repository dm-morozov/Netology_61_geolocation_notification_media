// src/ts/MediaService.ts

interface MediaRecorderErrorEvent extends Event {
  error: DOMException;
}

export default class MediaService {
  /**
   * Запрашивает доступ к медиа-устройствам (камера, микрофон)
   * и возвращает поток.
   * @param type Тип медиа: 'audio' или 'video'.
   * @returns {Promise<MediaStream>} Поток с медиа-устройства.
   */

  async getMediaStream(type: "audio" | "video"): Promise<MediaStream> {
    try {
      const constraints = { audio: true, video: type === "video" };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      throw new Error(
        `Не удалось получить доступ к медиа-устройствам: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Записывает медиа из потока.
   * @param stream Поток для записи.
   * @param duration Продолжительность записи в миллисекундах.
   * @returns {Promise<Blob>} Объект Blob с записанным медиа.
   */

  async recordMedia(stream: MediaStream, duration: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!window.MediaRecorder)
        reject(
          new Error("MediaRecorder API не поддерживается вашим браузером."),
        );

      const mimeType =
        stream.getVideoTracks().length > 0 ? "video/webm" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };

      recorder.onerror = (event: MediaRecorderErrorEvent) => {
        reject(
          new Error(
            `Ошибка записи: ${event.error.name} - ${event.error.message}`,
          ),
        );
      };

      recorder.start();

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, duration);
    });
  }
}
