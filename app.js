// Referencias a elementos del DOM
const openCameraBtn = document.getElementById("openCamera");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhoto");
const switchCameraBtn = document.getElementById("switchCamera");
const photoContainer = document.getElementById("photoContainer");
const photoResult = document.getElementById("photoResult");
const savePhotoBtn = document.getElementById("savePhoto");
const retakePhotoBtn = document.getElementById("retakePhoto");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let stream = null;
let currentFacingMode = "environment"; // 'environment' (trasera) o 'user' (frontal)
let currentImageDataURL = null;

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
  currentImageDataURL = canvas.toDataURL("image/jpeg", 0.95);

  // Mostrar la foto en pantalla
  showPhoto(currentImageDataURL);

  console.log(`Foto capturada: ${videoWidth}x${videoHeight}`);
}

// Función para mostrar la foto en pantalla
function showPhoto(imageDataURL) {
  photoResult.src = imageDataURL;
  photoResult.onload = () => {
    console.log("Foto mostrada correctamente");
  };
  photoContainer.style.display = "block";
  cameraContainer.style.display = "none";
  openCameraBtn.textContent = "Abrir Cámara";
  openCameraBtn.disabled = false;
}

// Función para guardar la foto
function savePhoto() {
  if (!currentImageDataURL) {
    alert("No hay foto para guardar");
    return;
  }

  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const cameraType =
    currentFacingMode === "environment" ? "trasera" : "frontal";

  link.download = `foto-${cameraType}-${timestamp}.jpg`;
  link.href = currentImageDataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("✅ Foto guardada correctamente");
  console.log("Foto guardada:", link.download);
}

// Función para tomar otra foto
function retakePhoto() {
  photoContainer.style.display = "none";
  currentImageDataURL = null;
  openCamera();
}

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
savePhotoBtn.addEventListener("click", savePhoto);
retakePhotoBtn.addEventListener("click", retakePhoto);

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
