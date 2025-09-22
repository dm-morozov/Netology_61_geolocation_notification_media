// src/ts/utils.ts

import { Coords } from "./Post";

/**
 * Валидирует и парсит строку с координатами.
 * @param coordsString Строка с координатами (например, '51.50851, -0.12572').
 * @returns {Coords} Объект с широтой и долготой.
 * @throws {Error} Если формат строки некорректен.
 */

export function parseCoords(coordsString: string): Coords {
  // Отчистим нашу строку от мусора
  const sanitizedString = coordsString
    .replace(/[^\d.,-]/g, "") // оставляем только d-цифры, точка, запятая и тире
    .replace(/\s+/g, ""); // Пробелы тоже уберем

  const coordsObj = sanitizedString.split(",");

  if (coordsObj.length !== 2)
    throw new Error("Неверный формат координат. Ожидается 'ширина, долгота'");

  const latitude = Number.parseFloat(coordsObj[0]);
  const longitude = Number.parseFloat(coordsObj[1]);
  console.log(latitude, longitude);

  // валидация на диапазон значений
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Некорректные значения широты или долготы.");
  }

  return { latitude, longitude };
}
