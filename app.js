// Referencias a elementos del DOM
const openCameraBtn = document.getElementById("openCamera");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhoto");
const switchCameraBtn = document.getElementById("switchCamera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Elementos de la galería
const galleryContainer = document.getElementById("galleryContainer");
const photoGallery = document.getElementById("photoGallery");
const photoCount = document.getElementById("photoCount");
const clearAllPhotos = document.getElementById("clearAllPhotos");

// Modal
const photoModal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.querySelector(".close-modal");
const savePhotoModal = document.getElementById("savePhotoModal");
const deletePhotoModal = document.getElementById("deletePhotoModal");

let stream = null;
let currentFacingMode = "environment"; // 'environment' (trasera) o 'user' (frontal)
let photos = []; // Array para almacenar las fotos
let currentPhotoIndex = null; // Índice de la foto actual en el modal

// Función para abrir la cámara
async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    // Cerrar cámara anterior si existe
    if (stream) {
      closeCamera();
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    // Esperar a que el video cargue sus metadatos
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    // Aplicar efecto espejo para cámara frontal
    if (currentFacingMode === "user") {
      video.style.transform = "scaleX(-1)";
    } else {
      video.style.transform = "scaleX(1)";
    }

    // Mostrar interfaz de cámara
    cameraContainer.style.display = "block";
    openCameraBtn.textContent = "Cámara Abierta";
    openCameraBtn.disabled = true;

    // Actualizar indicador de cámara actual
    updateCameraIndicator();

    console.log("Cámara abierta exitosamente");
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
  }
}

// Función para cambiar entre cámaras
async function switchCamera() {
  // Cambiar el modo de cámara
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  // Cerrar cámara actual
  if (stream) {
    closeCamera();
  }

  // Abrir nueva cámara
  await openCamera();
}

// Función para actualizar el indicador de cámara
function updateCameraIndicator() {
  const cameraType =
    currentFacingMode === "environment" ? "Trasera" : "Frontal";
  // Remover indicador anterior si existe
  const oldIndicator = document.querySelector(".current-camera");
  if (oldIndicator) {
    oldIndicator.remove();
  }

  // Crear nuevo indicador
  const indicator = document.createElement("div");
  indicator.className = "current-camera";
  indicator.textContent = `Cámara: ${cameraType}`;
  cameraContainer.insertBefore(indicator, cameraContainer.firstChild);
}

// Función para tomar foto
function takePhoto() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  // Obtener dimensiones reales del video
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // Ajustar canvas al tamaño REAL del video
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar el frame actual del video en el canvas
  if (currentFacingMode === "user") {
    // Para cámara frontal, voltear horizontalmente
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
    ctx.restore();
  } else {
    // Para cámara trasera, normal
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
  }

  // Convertir canvas a data URL (imagen de alta calidad)
  const imageDataURL = canvas.toDataURL("image/jpeg", 0.95);

  // Agregar foto a la galería
  addPhotoToGallery(imageDataURL, videoWidth, videoHeight);

  console.log(`Foto capturada: ${videoWidth}x${videoHeight}`);
}

// Función para agregar foto a la galería
function addPhotoToGallery(imageDataURL, width, height) {
  const timestamp = new Date();
  const cameraType =
    currentFacingMode === "environment" ? "Trasera" : "Frontal";

  // Crear objeto de foto
  const photo = {
    dataURL: imageDataURL,
    timestamp: timestamp,
    cameraType: cameraType,
    width: width,
    height: height,
  };

  // Agregar al inicio del array
  photos.unshift(photo);

  // Renderizar galería
  renderGallery();

  // Mostrar notificación
  showNotification("📸 Foto capturada");
}

// Función para renderizar la galería
function renderGallery() {
  // Limpiar galería
  photoGallery.innerHTML = "";

  // Si no hay fotos, ocultar contenedor
  if (photos.length === 0) {
    galleryContainer.classList.remove("active");
    return;
  }

  // Mostrar contenedor de galería
  galleryContainer.classList.add("active");

  // Actualizar contador
  photoCount.textContent = photos.length;

  // Crear elementos de foto
  photos.forEach((photo, index) => {
    const photoItem = document.createElement("div");
    photoItem.className = "photo-item";

    const img = document.createElement("img");
    img.src = photo.dataURL;
    img.alt = `Foto ${index + 1}`;

    const info = document.createElement("div");
    info.className = "photo-info";
    info.textContent = `${photo.cameraType} - ${formatTime(photo.timestamp)}`;

    photoItem.appendChild(img);
    photoItem.appendChild(info);

    // Click para abrir modal
    photoItem.addEventListener("click", () => {
      openPhotoModal(index);
    });

    photoGallery.appendChild(photoItem);
  });

  // Scroll al inicio (última foto tomada)
  photoGallery.scrollLeft = 0;
}

// Función para formatear tiempo
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Función para abrir modal de foto
function openPhotoModal(index) {
  currentPhotoIndex = index;
  const photo = photos[index];
  modalImage.src = photo.dataURL;
  photoModal.classList.add("active");
}

// Función para cerrar modal
function closePhotoModal() {
  photoModal.classList.remove("active");
  currentPhotoIndex = null;
}

// Función para guardar foto desde modal
function savePhotoFromModal() {
  if (currentPhotoIndex === null) return;

  const photo = photos[currentPhotoIndex];
  const link = document.createElement("a");
  const timestamp = photo.timestamp.toISOString().replace(/[:.]/g, "-");

  link.download = `foto-${photo.cameraType.toLowerCase()}-${timestamp}.jpg`;
  link.href = photo.dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification("✅ Foto guardada");
  console.log("Foto guardada:", link.download);
}

// Función para eliminar foto
function deletePhoto() {
  if (currentPhotoIndex === null) return;

  if (confirm("¿Eliminar esta foto?")) {
    photos.splice(currentPhotoIndex, 1);
    renderGallery();
    closePhotoModal();
    showNotification("🗑️ Foto eliminada");
  }
}

// Función para eliminar todas las fotos
function clearAllPhotosFunc() {
  if (photos.length === 0) return;

  if (confirm(`¿Eliminar todas las ${photos.length} fotos?`)) {
    photos = [];
    renderGallery();
    showNotification("🗑️ Todas las fotos eliminadas");
  }
}

// Función para mostrar notificación temporal
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Agregar estilos de animación
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Función para cerrar la cámara
function closeCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;

    // Restaurar interfaz
    video.srcObject = null;
    cameraContainer.style.display = "none";
    openCameraBtn.textContent = "Abrir Cámara";
    openCameraBtn.disabled = false;

    console.log("Cámara cerrada");
  }
}

// Event listeners
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
switchCameraBtn.addEventListener("click", switchCamera);
clearAllPhotos.addEventListener("click", clearAllPhotosFunc);

// Modal events
closeModal.addEventListener("click", closePhotoModal);
savePhotoModal.addEventListener("click", savePhotoFromModal);
deletePhotoModal.addEventListener("click", deletePhoto);

// Cerrar modal al hacer click fuera de la imagen
photoModal.addEventListener("click", (e) => {
  if (e.target === photoModal) {
    closePhotoModal();
  }
});

// Limpiar al cerrar la página
window.addEventListener("beforeunload", () => {
  closeCamera();
});

// Detectar si el dispositivo tiene cámara frontal
async function checkCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    if (videoDevices.length <= 1) {
      // Ocultar botón de cambiar cámara si solo hay una
      switchCameraBtn.style.display = "none";
    }

    console.log(`${videoDevices.length} cámara(s) detectada(s)`);
  } catch (error) {
    console.log("No se pudieron enumerar los dispositivos:", error);
  }
}

// Verificar cámaras disponibles al cargar la página
checkCameras();
