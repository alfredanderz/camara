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

// Configurar canvas con dimensiones
canvas.width = 640;
canvas.height = 480;

// Función para abrir la cámara
async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };

    // Cerrar cámara anterior si existe
    if (stream) {
      closeCamera();
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

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
  cameraContainer.appendChild(indicator);
}

// Función para tomar foto
function takePhoto() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  // Ajustar canvas al tamaño del video
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  canvas.width = videoWidth;
  canvas.height = videoHeight;

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

  // Convertir canvas a data URL (imagen)
  currentImageDataURL = canvas.toDataURL("image/png");

  // Mostrar la foto en pantalla
  showPhoto(currentImageDataURL);

  console.log("Foto capturada y mostrada");
}

// Función para mostrar la foto en pantalla
function showPhoto(imageDataURL) {
  photoResult.src = imageDataURL;
  photoContainer.style.display = "block";
  cameraContainer.style.display = "none";
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

  link.download = `foto-${cameraType}-${timestamp}.png`;
  link.href = currentImageDataURL;
  link.click();

  alert("✅ Foto guardada correctamente");
  console.log("Foto guardada:", link.download);
}

// Función para tomar otra foto
function retakePhoto() {
  photoContainer.style.display = "none";
  cameraContainer.style.display = "block";
  currentImageDataURL = null;
}

// Función para cerrar la cámara
function closeCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;

    // Restaurar interfaz
    video.srcObject = null;
    cameraContainer.style.display = "none";
    photoContainer.style.display = "none";
    openCameraBtn.textContent = "Abrir Cámara";
    openCameraBtn.disabled = false;
    currentImageDataURL = null;

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
  } catch (error) {
    console.log("No se pudieron enumerar los dispositivos:", error);
  }
}

// Verificar cámaras disponibles al cargar la página
checkCameras();
