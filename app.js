// Referencias a elementos del DOM
const openCameraBtn = document.getElementById("openCamera");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhoto");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let stream = null;

// Configurar canvas con dimensiones
canvas.width = 320;
canvas.height = 240;

// Función para abrir la cámara
async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 320 },
        height: { ideal: 240 },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    // Mostrar interfaz de cámara
    cameraContainer.style.display = "block";
    openCameraBtn.textContent = "Cámara Abierta";
    openCameraBtn.disabled = true;

    console.log("Cámara abierta exitosamente");
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
  }
}

// Función para tomar foto
function takePhoto() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  // Dibujar el frame actual del video en el canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convertir canvas a data URL (imagen)
  const imageDataURL = canvas.toDataURL("image/png");

  console.log("Foto capturada:", imageDataURL);

  // Crear y descargar la imagen
  downloadImage(imageDataURL);

  // Cerrar cámara después de tomar foto
  closeCamera();
}

// Función para descargar la imagen
function downloadImage(dataUrl) {
  const link = document.createElement("a");
  link.download = "foto-" + new Date().getTime() + ".png";
  link.href = dataUrl;
  link.click();
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

// Limpiar al cerrar la página
window.addEventListener("beforeunload", () => {
  closeCamera();
});
