// src/ts/GeolocationService.ts

import { Coords } from "./Post";

export default class GeolocationService {
  // Запрашиваем и возвращаем текущие координаты пользователя
  //  @returns {Promise<{ latitude: number, longitude: number } | Error>}

  async getCurrentPosition(): Promise<Coords> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Геолокация не поддерживается в вашем браузере."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(new Error(error.message));
        },
      );
    });
  }
}
