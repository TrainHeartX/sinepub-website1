// Este archivo ahora solo contiene la funcionalidad del chat IA
// La autenticación se ha movido a auth-popup.js

// 🔹 Función para mostrar el Popup de autenticación
function showAuthPopup() {
    console.log("🛠 Redirigiendo a la función de autenticación en auth-popup.js");
    
    // Verificar si la función existe en el ámbito global (window)
    if (typeof window.showAuthPopup === 'function') {
        window.showAuthPopup();
    } else {
        console.error("❌ La función showAuthPopup no está disponible globalmente. Asegúrate de que auth-popup.js se cargue antes que chatbot-access.js");
        alert("Error al cargar el sistema de autenticación. Por favor, recarga la página.");
    }
}

// ✅ Verificación de cédula
function verifyCedula() {
    console.log("🛠 Redirigiendo a la función de verificación en auth-popup.js");
    
    // Obtener el valor de la cédula
    const cedula = document.getElementById("cedula-input").value;
    
    // Verificar si la función existe en el ámbito global (window)
    if (typeof window.verifyCedula === 'function') {
        window.verifyCedula(cedula);
    } else {
        console.error("❌ La función verifyCedula no está disponible globalmente. Asegúrate de que auth-popup.js se cargue antes que chatbot-access.js");
        alert("Error al cargar el sistema de verificación. Por favor, recarga la página.");
    }
}

// ✅ Función corregida para mostrar el popup
function mostrarPopupBienvenida(mensaje) {
    console.log("✅ Acceso concedido. Mostrando popup de bienvenida...");

    const popupBienvenida = document.createElement("div");
    popupBienvenida.id = "popup-bienvenida";
    popupBienvenida.style.position = "fixed";
    popupBienvenida.style.top = "50%";
    popupBienvenida.style.left = "50%";
    popupBienvenida.style.transform = "translate(-50%, -50%)";
    popupBienvenida.style.background = "#35a9aa"; // Verde aguamarina
    popupBienvenida.style.color = "#0249aa"; // Azul para el texto
    popupBienvenida.style.padding = "30px";
    popupBienvenida.style.borderRadius = "10px";
    popupBienvenida.style.textAlign = "center";
    popupBienvenida.style.width = "500px";  // 🔥 Aumenté el ancho
    popupBienvenida.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    popupBienvenida.style.zIndex = "10000";

    popupBienvenida.innerHTML = `
        ${mensaje}
        <button id="cerrar-popup" style="
            background-color: red;
            color: white;
            font-size: 16px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease-in-out;">
            Aceptar
        </button>
    `;

    document.body.appendChild(popupBienvenida);

    // 🔹 Alineación a la izquierda de los ítems de la lista
    const lista = popupBienvenida.querySelector("ul");
    if (lista) {
        lista.style.textAlign = "left";  // ✅ Texto alineado a la izquierda
        lista.style.marginLeft = "20px"; // 🔥 Desplaza la lista un poco a la derecha
        lista.style.paddingLeft = "15px"; // 🔹 Pequeño padding para mejor alineación
    }

    // 🔹 Evento para cambiar el color del botón en hover
    const botonAceptar = document.getElementById("cerrar-popup");
    botonAceptar.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "green";
        this.style.color = "black"; // ✅ Letras negras en hover
    });

    botonAceptar.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "red";
        this.style.color = "white"; // ✅ Restauramos el color original
    });

    botonAceptar.addEventListener("click", function () {
        popupBienvenida.remove();
        activarChatbot();
    });

    // Ocultar el popup de autenticación si aún existe
    const authPopup = document.getElementById("auth-popup");
    if (authPopup) {
        authPopup.remove();
    }
}


function mostrarPopupError() {
    console.log("🚨 Mostrando popup de error...");

    const popupError = document.createElement("div");
    popupError.id = "popup-error";
    popupError.style.position = "fixed";
    popupError.style.top = "50%";
    popupError.style.left = "50%";
    popupError.style.transform = "translate(-50%, -50%)";
    popupError.style.background = "#35a9aa";
    popupError.style.color = "white"; // Texto en blanco
    popupError.style.padding = "25px";
    popupError.style.borderRadius = "10px";
    popupError.style.textAlign = "center";
    popupError.style.width = "420px";
    popupError.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    popupError.style.zIndex = "10000";

    popupError.innerHTML = `
        <h2 style="color: white; font-size: 22px; margin-bottom: 15px;">❌ Cédula Incorrecta</h2>
        <p>No estás afiliado a nuestro sindicato. Pero no te preocupes, puedes afiliarte llenando nuestro formulario en línea:</p>
        <p><strong>1️⃣ Llena el formulario en la sección de afiliación.</strong></p>
        <p><strong>2️⃣ Descárgalo, agrégale tu huella y llévalo al sindicato en el séptimo piso.</strong></p>
        <button id="cerrar-popup-error" style="
            background-color: gray;
            color: white;
            font-size: 16px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease-in-out;">
            Aceptar
        </button>
    `;

    document.body.appendChild(popupError);

    // Evento para cerrar el popup
    document.getElementById("cerrar-popup-error").addEventListener("click", function () {
        popupError.remove();
    });

    // Ocultar el popup de autenticación
    document.getElementById("auth-popup").remove();
}


// 🔹 Función para activar la segunda verificación de contraseña maestra
let intentosRestantes = 3;

async function mostrarPopupContrasena(nombre, cargo, cedula) {
    const popupContrasena = crearPopupContrasena();
    
    document.getElementById("verificar-contrasena").addEventListener("click", async () => {
        const contrasena = document.getElementById("input-contrasena").value;
        
        try {
            const response = await fetch(`${API_ENDPOINTS.validarCodigo}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cedula, codigo: contrasena })
            });
            
            const data = await response.json();
            
            if (data.valid) {
                popupContrasena.remove();
                localStorage.setItem("afiliado_autenticado", "true"); // Única excepción permitida
                verificarEstadoPerfil(cedula);
            } else {
                manejarIntentoFallido();
            }
        } catch (error) {
            console.error("Error:", error);
            mostrarError("Error de conexión");
        }
    });
}

function manejarIntentoFallido() {
    intentosRestantes--;
    if (intentosRestantes <= 0) {
        localStorage.setItem("acceso_bloqueado", "true"); // Excepción permitida para bloqueo
        bloquearBoton();
        mostrarError("Acceso bloqueado por múltiples intentos fallidos");
    } else {
        mostrarError(`Contraseña incorrecta. ${intentosRestantes} intentos restantes`);
    }
}

// 🔹 Función para activar el chatbot después de cerrar el popup
async function activarChatbot() {
    console.log("🎙️ Activando chatbot con IA...");

    const botonChat = document.getElementById("chatbot-button");
    const linkEstatutos = document.getElementById("estatutos-link");
    const linkEstatutosMobile = document.getElementById("estatutos-link-mobile");
    const linkModulos = document.getElementById("modulos-link");
    const linkAfiliacion = document.getElementById("afiliacion-link");
    const botonFlotante = document.getElementById("boton-flotante");
    const contenedorChatbot = document.getElementById("chatbot-container");

    // Ocultar botón y mostrar/ocultar enlaces
    if (botonChat) botonChat.style.display = "none";
    if (linkEstatutos) linkEstatutos.style.display = "inline";
    if (linkEstatutosMobile) linkEstatutosMobile.style.display = "block";
    if (linkModulos) linkModulos.style.display = "inline";
    if (linkAfiliacion) linkAfiliacion.style.display = "none";

    // Mostrar y configurar el contenedor del chatbot
    if (contenedorChatbot) {
        contenedorChatbot.style.display = "block";
        contenedorChatbot.innerHTML = `
            <div class="elektra-chat-interface">
                <div class="chat-header">
                    <img src="images/HUV.jpg" alt="Elektra Avatar" class="elektra-avatar">
                    <h3>ELEKTRA - Asistente Virtual</h3>
                    <button class="close-chat">×</button>
                </div>
                <div id="chat-messages" class="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" id="user-input" placeholder="Escribe tu mensaje aquí...">
                    <button id="send-message">
                        Enviar
                    </button>
                </div>
            </div>
        `;

        try {
            // Inicializar el chat
            await inicializarChatIA();
            console.log('Chat inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar el chat:', error);
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'message ai-message';
                errorMsg.textContent = 'Lo siento, hubo un error al inicializar el chat. Por favor, recarga la página.';
                chatMessages.appendChild(errorMsg);
            }
        }

        // Agregar funcionalidad al botón de cerrar
        const closeButton = contenedorChatbot.querySelector('.close-chat');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                contenedorChatbot.style.display = "none";
                if (botonFlotante) {
                    botonFlotante.style.display = "block";
                }
            });
        }
    } else {
        console.error("No se encontró el contenedor del chatbot");
    }
}

// Variable global para la instancia de AIChat
let aiChatInstance = null;

async function inicializarChatIA() {
    // Obtener referencias a los elementos del DOM
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');

    // Crear instancia de AIChat si no existe
    if (!aiChatInstance) {
        try {
            // Usar la clase AIChat global
            aiChatInstance = new AIChat();

            // --- MODIFICADO: Obtener nombre y cargo de localStorage --- 
            const nombreUsuario = localStorage.getItem('nombre');
            const cargoUsuario = localStorage.getItem('cargo');
            console.log(`🤖 Obteniendo datos para rol del chat: Nombre=${nombreUsuario}, Cargo=${cargoUsuario}`);
            
            // Determinar el rol basado en el cargo del usuario
            let roleType = 'NoAfiliado'; // Rol por defecto
            if (cargoUsuario) {
                if (cargoUsuario === 'Presidente') {
                    roleType = 'Presidenciales';
                } else if (cargoUsuario.includes('Directiv')) {
                    roleType = 'JuntaDirectiva';
                } else if (cargoUsuario === 'Afiliado') {
                    roleType = 'Afiliado';
                }
            } else {
                 console.warn("🤖 No se encontró cargo en localStorage, usando rol por defecto.");
            }
            console.log(`🤖 Rol asignado para el chat: ${roleType}`);
            // --- FIN MODIFICACIÓN ---

            // Inicializar el chat con el rol apropiado
            await aiChatInstance.initialize(roleType);
        } catch (error) {
            console.error('Error al inicializar AIChat:', error);
            mostrarMensajeIA('Lo siento, hubo un error al inicializar el chat. Por favor, recarga la página.');
            return;
        }
    }

    // Mensaje de bienvenida
    mostrarMensajeIA("¡Hola! Soy Elektra, tu asistente virtual. ¿En qué puedo ayudarte hoy?");

    // Manejar envío de mensajes
    async function enviarMensaje() {
        const mensaje = userInput.value.trim();
        if (!mensaje) return;

        // Mostrar mensaje del usuario
        mostrarMensajeUsuario(mensaje);
        userInput.value = '';

        try {
            // Usar la instancia de AIChat para procesar el mensaje
            const respuesta = await aiChatInstance.processMessage(mensaje);

            // Mostrar respuesta de la IA
            mostrarMensajeIA(respuesta);

        } catch (error) {
            console.error("Error al procesar mensaje:", error);
            mostrarMensajeIA("Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.");
        }
    }

    // Event listeners
    sendButton.addEventListener('click', enviarMensaje);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarMensaje();
    });
}

function mostrarMensajeUsuario(mensaje) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = mensaje;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function mostrarMensajeIA(mensaje) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.textContent = mensaje;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 🔹 Función para bloquear el botón en caso de acceso denegado
function bloquearBoton() {
    const chatButton = document.getElementById("chatbot-button");
    if (chatButton) {
        chatButton.style.backgroundColor = "red";
        chatButton.style.color = "white";
        chatButton.style.cursor = "not-allowed";
        chatButton.innerText = "❌ No eres afiliado al sindicato";
        chatButton.disabled = true;

        // 🔴 Guardar en LocalStorage que falló la validación
        localStorage.setItem("afiliado", "no");
    }
}

