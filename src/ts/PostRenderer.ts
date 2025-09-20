// src/ts/PostRenderer.ts

import Post from "./Post";

// Создает и возвращает HTML-элемент для поста.

export default class PostRenderer {
  static render(post: Post): HTMLElement {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Форматируем координаты для отображения

    let coordsText = "";
    if (post.coords) {
      coordsText = `Координаты: ${post.coords.latitude.toFixed(5)}, ${post.coords.longitude.toFixed(5)}`;
    } else {
      coordsText = "Координаты не указаны.";
    }

    // В зависимости от типа поста, у нас будет разное содержимое

    let contentHtml = "";
    if (post.type === "text") {
      contentHtml = `<p class="post-text">${post.content}</p>`;
    } else if (post.type === "audio") {
      contentHtml = `<audio controls src="${post.content}" class="post-audio" muted></audio>`;
    } else if (post.type === "video") {
      contentHtml = `<video controls src="${post.content}" class="post-video" muted></video>`;
    }

    postElement.innerHTML = `
      <div class="post-header">
        <p class="post-date">${new Date(post.timestamp).toLocaleString()}</p>
      </div>
      <div class="post-content-wrapper">
        ${contentHtml}
      </div>
      <div class="post-footer">
        <p class="post-coords">${coordsText}</p>
      </div>
    `;

    return postElement;
  }
}
