// src/ts/Timeline.ts

import GeolocationService from "./GeolocationService";
import Post from "./Post"; // Класс-модель для данных поста
import PostRenderer from "./PostRenderer"; // Класс для отображения поста
import Modal from "./Modal";
import { parseCoords } from "./utils";
import MediaService from "./MediaService";

export default class Timeline {
  private postContainer: HTMLElement;
  private postInput: HTMLInputElement;
  private geolocationService: GeolocationService;
  private modal: Modal;
  private mediaService: MediaService;
  private audioBtn: HTMLButtonElement;
  private videoBtn: HTMLButtonElement;
  private countdownDisplay: HTMLElement;
  private countdownInterval: number | undefined;
  private inputBlock: HTMLElement;

  private readonly RECORD_DURATION_SECONDS = 5; // Длительность записи

  constructor() {
    this.postContainer = document.querySelector(
      "#posts-container",
    ) as HTMLElement;
    this.postInput = document.querySelector("#post-input") as HTMLInputElement;
    this.geolocationService = new GeolocationService();
    this.modal = new Modal();
    this.mediaService = new MediaService();
    this.audioBtn = document.querySelector("#audio-btn") as HTMLButtonElement;
    this.videoBtn = document.querySelector("#video-btn") as HTMLButtonElement;
    this.countdownDisplay = document.querySelector(
      "#countdown-display",
    ) as HTMLElement;
    this.inputBlock = document.querySelector("#input-block") as HTMLElement;

    this.initEventListener();
  }

  private initEventListener() {
    this.postInput.addEventListener(
      "keypress",
      this.handlePostInput.bind(this),
    );

    this.audioBtn.addEventListener("click", () => {
      this.handleMediaPost("audio");
    });

    this.videoBtn.addEventListener("click", () => {
      this.handleMediaPost("video");
    });
  }

  private async handlePostInput(event: KeyboardEvent) {
    if (event.key === "Enter" && this.postInput.value.trim() !== "") {
      const text = this.postInput.value.trim();
      this.postInput.value = "";

      try {
        const coords = await this.geolocationService.getCurrentPosition();
        this.createAndAddPost("text", text, coords);
      } catch (error) {
        console.error("Ошибка получения координат:", (error as Error).message);

        const coordsString = await this.modal.show();

        if (coordsString) {
          try {
            const manualCoords = parseCoords(coordsString);
            console.log("Введенные координаты:", manualCoords);
            this.createAndAddPost("text", text, manualCoords);
          } catch (parseError) {
            console.error(
              `Ошибка ввода координат: ${(parseError as Error).message}`,
            );
            this.createAndAddPost("text", text, null);
          }
        } else {
          // Если произошла ошибка, мы вызываем метод с `null` вместо координат.
          this.createAndAddPost("text", text, null);
          console.log("Добавление поста отменено.");
        }

        // Пока просто выведем сообщение, позже заменим на логику модального окна
        // alert(
        //   `Ошибка: ${(error as Error).message}. Пожалуйста, введите координаты вручную.`,
        // );
      }
    }
  }

  private toggleUIForRecording(isRecording: boolean) {
    if (isRecording) {
      this.inputBlock.classList.add("is-recording");
    } else {
      this.inputBlock.classList.remove("is-recording");
    }
  }

  private startCountdown(duration: number) {
    let timeLeft = duration;
    this.postInput.value = String(timeLeft);
    this.postInput.disabled = true;

    this.countdownInterval = setInterval(() => {
      timeLeft--;
      this.postInput.value = String(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000) as unknown as number;
  }

  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
    this.postInput.value = "";
    this.postInput.placeholder = "Введите текст поста...";
    this.postInput.disabled = false;
  }

  private async handleMediaPost(type: "audio" | "video") {
    let mediaBlob: Blob | null = null;
    let coords: Post["coords"] = null;

    try {
      const stream = await this.mediaService.getMediaStream(type);
      console.log(`Началась запись ${type}...`);

      // управляем интерфейсом и запускаем таймер
      this.toggleUIForRecording(true);
      this.startCountdown(this.RECORD_DURATION_SECONDS);

      mediaBlob = await this.mediaService.recordMedia(
        stream,
        this.RECORD_DURATION_SECONDS * 1000,
      );
      // Остановка потока, чтобы выключить камеру/микрофон
      stream.getTracks().forEach((track) => track.stop());
      console.log(`Запись ${type} завершена.`);

      try {
        coords = await this.geolocationService.getCurrentPosition();
      } catch (error) {
        // Если GPS не работает, запросим координаты через модальное окно
        console.error("Ошибка получения координат:", (error as Error).message);
        const coordsString = await this.modal.show();
        if (coordsString) {
          try {
            coords = parseCoords(coordsString);
          } catch (parseError) {
            // alert(`Ошибка ввода координат: ${(parseError as Error).message}`);
            console.error(
              `Ошибка ввода координат: ${(parseError as Error).message}`,
            );
          }
        }
      }

      if (mediaBlob) {
        // Генерируем временный URL для этого файла
        const mediaUrl = URL.createObjectURL(mediaBlob);
        this.createAndAddPost(type, mediaUrl, coords);
      }
    } catch (error) {
      console.error(
        "Ошибка при работе с медиа-устройствами:",
        (error as Error).message,
      );
      alert(`Ошибка: ${(error as Error).message}`);
    } finally {
      // Гарантируем, что кнопки и поле ввода вернутся в любом случае
      this.stopCountdown();
      this.toggleUIForRecording(false);
    }
  }

  // Этот метод отвечает за создание объекта Post и его отображение на странице.
  // Он передает данные в другие классы, которые выполняют свою узкую задачу.

  private createAndAddPost(
    type: Post["type"],
    content: string,
    coords: Post["coords"],
  ) {
    const postData = new Post(type, content, coords);

    const postElement = PostRenderer.render(postData);
    this.postContainer.prepend(postElement);
  }
}
