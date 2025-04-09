// Función para mostrar el Popup de autenticación
function showAuthPopup() {
    console.log("🔐 Intentando mostrar el popup...");
    console.trace('Traza de la llamada a showAuthPopup');

    try {
        const existingPopup = document.getElementById("auth-popup");
        if (existingPopup) {
            console.log("⚠ Popup ya está abierto.");
            return;
        }

        console.log('Creando nuevo popup de autenticación...');

        const popup = document.createElement("div");
        popup.id = "auth-popup";
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.background = "white";
        popup.style.padding = "20px";
        popup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
        popup.style.zIndex = "10000";
        popup.style.borderRadius = "8px";
        popup.style.textAlign = "center";

        popup.innerHTML = `
            <h3>Acceso Restringido, Solo Afiliados</h3>
            <p>Ingrese su número de cédula para continuar</p>
            <input type="text" id="cedula-input" placeholder="Cédula">
            <button id="verificar-cedula-btn">Verificar</button>
            <button id="cerrar-popup-btn">Cerrar</button>
        `;

        document.body.appendChild(popup);
        console.log("✅ Popup de autenticación añadido al DOM.");

        // Agregar event listeners a los botones
        document.getElementById('verificar-cedula-btn').addEventListener('click', function() {
            const cedula = document.getElementById('cedula-input').value;
            verifyCedula(cedula);
        });

        document.getElementById('cerrar-popup-btn').addEventListener('click', function() {
            document.getElementById('auth-popup').remove();
        });

        // Permitir enviar con Enter
        document.getElementById('cedula-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const cedula = document.getElementById('cedula-input').value;
                verifyCedula(cedula);
            }
        });
    } catch (error) {
        console.error('Error al crear el popup:', error);
    }
}

// Verificación de cédula
function verifyCedula(cedula) {
    console.log("Verificando cédula:", cedula);

    if (!cedula) {
        alert("Por favor ingrese un número de cédula válido");
        return;
    }

    // NUEVO: Guardar cédula en localStorage
    localStorage.setItem("cedula", cedula);

    // Usar la URL del API de publicidad 
    const backendUrl = window.API_ENDPOINTS ? window.API_ENDPOINTS.publicidad : "http://localhost:8000/api/publicidad";
    
    console.log("🔄 Verificando cédula en:", backendUrl);
    
    // Verificar si el servidor está activo antes de hacer la solicitud
    fetch(backendUrl, { method: 'OPTIONS' })
        .then(response => {
            console.log("✅ Servidor backend disponible. Verificando cédula.");
            return verificarCedulaEnServidor(cedula);
        })
        .catch(error => {
            console.error("🚨 Error de conexión con el servidor:", error);
            alert("El servidor no está respondiendo. Verifica tu conexión a internet y que el servidor esté activo.");
        });
}

// Función para cerrar el popup de autenticación
function closeAuthPopup() {
    const authPopup = document.getElementById("auth-popup");
    if (authPopup) {
        authPopup.remove();
    }
}

// Función separada para verificar la cédula una vez confirmado que el servidor está activo
function verificarCedulaEnServidor(cedula) {
    console.log("🔍 Verificando cédula:", cedula);
    
    // Guardar la cédula en localStorage para usarla más tarde
    localStorage.setItem("cedula", cedula);
    
    // Mostrar indicador de carga
    const btnVerificar = document.getElementById('verificar-cedula-btn');
    if (btnVerificar) {
        btnVerificar.textContent = 'Verificando...';
        btnVerificar.disabled = true;
    }
    
    // Usar la URL específica para verificación de cédula
    const verificarCedulaUrl = window.API_ENDPOINTS && window.API_ENDPOINTS.verificarCedula ? 
                              window.API_ENDPOINTS.verificarCedula : 
                              "http://localhost:8001/api/verificar_cedula";
    
    console.log("📡 Usando URL para verificación:", verificarCedulaUrl);
    
    fetch(verificarCedulaUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula })
    })
    .then(response => {
        console.log("📡 Status respuesta verificación cédula:", response.status, response.statusText);
        console.log("📡 Tipo de contenido:", response.headers.get('content-type'));
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error("⚠️ Respuesta no es JSON:", contentType);
            // Si no es JSON, leer como texto y mostrar parte del contenido para diagnóstico
            return response.text().then(text => {
                console.error("Contenido HTML recibido (primeros 500 caracteres):", text.substring(0, 500) + "...");
                console.error("URL completa de la solicitud:", verificarCedulaUrl);
                throw new Error('La respuesta del servidor no es JSON válido. Posiblemente el servidor está devolviendo una página HTML de error.');
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log("📡 Respuesta verificación cédula:", data);
        
        // Restaurar botón
        if (btnVerificar) {
            btnVerificar.textContent = 'Verificar';
            btnVerificar.disabled = false;
        }
        
        if (data.error) {
            mostrarError(data.error);
            return;
        }
        
        if (data.valid) {
            mostrarFormularioPerfil(cedula, data.nombre);
        } else {
            mostrarError("La cédula ingresada no es válida o no está registrada en el sistema.");
        }
    })
    .catch(error => {
        console.error('Error al verificar cédula:', error);
        
        // Restaurar botón
        if (btnVerificar) {
            btnVerificar.textContent = 'Verificar';
            btnVerificar.disabled = false;
        }
        
        mostrarError("Error al verificar la cédula: " + error.message);
    });
}

// Función para mostrar el popup de contraseña
function mostrarPopupContrasena(nombre, cargo, mensajeBienvenida) {
    const popupContrasena = document.createElement("div");
    popupContrasena.id = "popup-contrasena";
    popupContrasena.style.position = "fixed";
    popupContrasena.style.top = "50%";
    popupContrasena.style.left = "50%";
    popupContrasena.style.transform = "translate(-50%, -50%)";
    popupContrasena.style.background = "#ffffff";
    popupContrasena.style.color = "#000000";
    popupContrasena.style.padding = "25px";
    popupContrasena.style.borderRadius = "10px";
    popupContrasena.style.textAlign = "center";
    popupContrasena.style.width = "400px";
    popupContrasena.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    popupContrasena.style.zIndex = "10000";

    popupContrasena.innerHTML = `
        <h3>🔐 Verificación Adicional</h3>
        <p>${nombre}, por favor ingresa la contraseña maestra para continuar.</p>
        <input type="password" id="input-contrasena" placeholder="Contraseña">
        <br><br>
        <button id="verificar-contrasena">Verificar</button>
        <button id="cancelar-contrasena">Cancelar</button>
    `;

    document.body.appendChild(popupContrasena);

    let intentosRestantes = 2;

    document.getElementById("verificar-contrasena").addEventListener("click", function() {
        const contrasena = document.getElementById("input-contrasena").value;

        // Validar código mediante el backend en lugar de comparar directamente
        const validarUrl = window.API_ENDPOINTS ? `${window.API_ENDPOINTS.validarCodigo}/${contrasena}` : `http://localhost:8000/api/validar-codigo/${contrasena}`;
        
        console.log("🔄 Validando código con el backend:", validarUrl);
        
        fetch(validarUrl)
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    popupContrasena.remove();
                    mostrarPopupBienvenida(mensajeBienvenida);
                    // Guardar datos del usuario para el chat
                    if (window.setUserData) {
                        window.setUserData(nombre, cargo);
                    }
                } else {
                    intentosRestantes--;
                    popupContrasena.remove();

                    if (intentosRestantes > 0) {
                        alert(`❌ Contraseña incorrecta. Te queda ${intentosRestantes} intento.`);
                        mostrarPopupContrasena(nombre, cargo, mensajeBienvenida);
                    } else {
                        alert("❌ No eres afiliado al sindicato. Recuerda que la suplantación de identidad tiene consecuencias penales.");
                        mostrarPopupError();
                        bloquearBoton();
                    }
                }
            })
            .catch(error => {
                console.error("🚨 Error al validar código:", error);
                alert("⚠ Ocurrió un error al validar la contraseña. Por favor, intenta nuevamente.");
                popupContrasena.remove();
                mostrarPopupContrasena(nombre, cargo, mensajeBienvenida);
            });
    });

    document.getElementById("cancelar-contrasena").addEventListener("click", function() {
        popupContrasena.remove();
    });
}

// Función para mostrar el popup de bienvenida
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
    popupBienvenida.style.width = "500px";
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

    // Alineación a la izquierda de los ítems de la lista
    const lista = popupBienvenida.querySelector("ul");
    if (lista) {
        lista.style.textAlign = "left";
        lista.style.marginLeft = "20px";
        lista.style.paddingLeft = "15px";
    }

    // Evento para cambiar el color del botón en hover
    const botonAceptar = document.getElementById("cerrar-popup");
    botonAceptar.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "green";
        this.style.color = "black";
    });

    botonAceptar.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "red";
        this.style.color = "white";
    });

    botonAceptar.addEventListener("click", function () {
        popupBienvenida.remove();

        // Guardar en localStorage que el usuario está autenticado
        localStorage.setItem("afiliado", "yes");

        // Extraer nombre y cargo del usuario del mensaje
        let nombre = "Usuario";
        let cargo = "Afiliado";

        // Intentar extraer el nombre del mensaje
        const nombreMatch = mensaje.match(/<strong>([^<]+)<\/strong>/);
        if (nombreMatch && nombreMatch[1]) {
            nombre = nombreMatch[1];
            localStorage.setItem("nombre", nombre);
        }

        // Intentar extraer el cargo del mensaje
        const cargoMatch = mensaje.match(/Como <strong>([^<]+)<\/strong>/);
        if (cargoMatch && cargoMatch[1]) {
            cargo = cargoMatch[1];
            localStorage.setItem("cargo", cargo);
        }
        
        // NUEVO: Verificar si el usuario ya existe en el backend y solicitar foto/email si es necesario
        const cedula = localStorage.getItem("cedula");
        if (cedula) {
            verificarPerfilUsuario();
        } else {
            // Si no tenemos la cédula almacenada, continuar con activación normal
            // Activar el chat con el nuevo sistema de botón flotante
            if (window.activateChatAfterAuth) {
                window.activateChatAfterAuth(nombre, cargo);
            } else {
                console.error("La función activateChatAfterAuth no está disponible");
                // Fallback al método antiguo
                activarChatbot();
            }
        }
    });

    // Ocultar el popup de autenticación si aún existe
    const authPopup = document.getElementById("auth-popup");
    if (authPopup) {
        authPopup.remove();
    }
}

// NUEVA FUNCIÓN: Verificar si el usuario necesita completar su perfil
function verificarPerfilUsuario() {
    const cedula = localStorage.getItem("cedula");
    const nombre = localStorage.getItem("nombre");
    const correo = localStorage.getItem("correo");
    const email = localStorage.getItem("email");
    const perfilCompleto = localStorage.getItem("perfil_completo");
    
    console.log("🔍 Verificando perfil de usuario:");
    console.log("- Cédula:", cedula);
    console.log("- Nombre:", nombre);
    console.log("- Correo:", correo);
    console.log("- Email:", email);
    console.log("- Perfil completo:", perfilCompleto);
    
    // Comprobar primero si el perfil ya está marcado como completo en localStorage
    if (perfilCompleto === "true") {
        console.log("🔍 Perfil ya marcado como completo en localStorage");
        
        // Si estamos en la página de publicidad, primero configurar el botón de registro
        if (window.configurarBotonRegistro) {
            console.log("🔄 Reconfigurando botón de registro después de verificar perfil completo");
            window.configurarBotonRegistro();
        }
        
        // --- MODIFICADO: Solo crear el botón flotante, no activar el chat --- 
        console.log("👤 Perfil completo (LocalStorage). Asegurando botón flotante.");
        crearBotonFlotante();
        return; 
    }
    
    // Obtener datos del perfil del usuario desde el backend
    fetch(`${getBackendUrl()}/obtener_perfil`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula })
    })
    .then(response => {
        console.log("📡 Status respuesta obtención perfil:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                console.error("⚠️ Respuesta no es JSON:", contentType);
                console.error("Contenido recibido (primeros 500 caracteres):", text.substring(0, 500) + "...");
                throw new Error('La respuesta del servidor no es JSON válido');
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log("📡 Datos de perfil del usuario:", data);
        
        if (data.perfil_completo) {
            // El perfil ya está completo, guardar esta información en localStorage
            localStorage.setItem('perfil_completo', 'true');
            
            // Guardar los datos del usuario en localStorage
            if (data.datos) {
                if (data.datos.nombre) localStorage.setItem('nombre', data.datos.nombre);
                if (data.datos.correo) {
                    localStorage.setItem('correo', data.datos.correo);
                    localStorage.setItem('email', data.datos.correo);
                }
                if (data.datos.foto_ruta) localStorage.setItem('foto_ruta', data.datos.foto_ruta);
            }
            
            // Si estamos en la página de publicidad, configurar el botón de registro
            if (window.configurarBotonRegistro) {
                console.log("🔄 Reconfigurando botón de registro después de obtener datos completos");
                window.configurarBotonRegistro();
            }
            
            // --- MODIFICADO: Solo crear el botón flotante, no activar el chat --- 
            console.log("👤 Perfil completo (Backend). Asegurando botón flotante.");
            crearBotonFlotante(); 
            // Ya no se llama a activarChatbot aquí.
            
        } else {
            // Mostrar formulario para completar perfil
            mostrarFormularioCompletarPerfil(cedula, nombre);
        }
    })
    .catch(error => {
        console.error('Error al obtener datos del perfil:', error);
        // Si hay error, mostrar formulario por defecto
        mostrarFormularioCompletarPerfil(cedula, nombre);
    });
}

// Función para mostrar el formulario de completar perfil
function mostrarFormularioCompletarPerfil(cedula, nombre) {
    console.log("📋 Mostrando formulario para completar perfil");
    
    const existingPopup = document.getElementById("auth-popup");
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const popup = document.createElement("div");
    popup.id = "auth-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.padding = "20px";
    popup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    popup.style.zIndex = "10000";
    popup.style.borderRadius = "8px";
    popup.style.width = "400px";
    popup.style.textAlign = "center";

    popup.innerHTML = `
        <h3>Completa tu perfil</h3>
        <p>Por favor completa la siguiente información para continuar:</p>
        
        <div id="profile-panel">
            <div style="margin-bottom: 15px;">
                <label for="nombre">Nombre completo:</label>
                <input type="text" id="nombre" value="${nombre || ''}" placeholder="Tu nombre completo">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="correo">Correo electrónico:</label>
                <input type="email" id="correo" placeholder="tu@correo.com">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Foto de perfil:</label>
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;">
                    <img id="user-photo-preview" src="" alt="Foto de perfil" style="width: 100px; height: 100px; border-radius: 50%; border: 1px solid #ccc; object-fit: cover; display: none;">
                    <input type="file" id="user-photo" accept="image/*" style="display: block; margin: 10px auto;">
                </div>
            </div>
            
            <button id="guardar-perfil-btn">Guardar Perfil</button>
            <button id="cancelar-perfil-btn">Cancelar</button>
        </div>
    `;

    document.body.appendChild(popup);
    
    // Obtener correo de localStorage si existe
    const correo = localStorage.getItem("correo");
    if (correo) {
        document.getElementById('correo').value = correo;
    }
    
    // Evento para previsualizar la imagen seleccionada
    document.getElementById('user-photo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('user-photo-preview');
                preview.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Evento para guardar el perfil
    let guardarBtn = document.getElementById('guardar-perfil-btn');
    let cancelarBtn = document.getElementById('cancelar-perfil-btn');
    
    if (guardarBtn) {
        // --- CLONAR PARA LIMPIAR LISTENERS ---
        const newGuardarBtn = guardarBtn.cloneNode(true);
        guardarBtn.parentNode.replaceChild(newGuardarBtn, guardarBtn);
        guardarBtn = newGuardarBtn; // Actualizar la referencia
        // --- FIN CLONADO ---
        
        guardarBtn.addEventListener('click', function() {
            // Deshabilitar botones
            guardarBtn.disabled = true;
            guardarBtn.textContent = 'Guardando...';
            if(cancelarBtn) cancelarBtn.disabled = true;
            
            const nombreValue = document.getElementById('nombre').value;
            const correoValue = document.getElementById('correo').value;
            const fotoPreview = document.getElementById('user-photo-preview');
            const fotoValue = fotoPreview.style.display !== 'none' ? fotoPreview.src : '';
            
            // Pasar la referencia correcta del botón
            guardarPerfilUsuario(cedula, nombreValue, correoValue, fotoValue, guardarBtn, cancelarBtn);
        });
    }
    
    // Evento para cancelar (podría necesitar clonado similar si la función se llama múltiples veces)
    if (cancelarBtn) {
        // Opcional: Clonar y reemplazar cancelarBtn si es necesario
        // const newCancelarBtn = cancelarBtn.cloneNode(true);
        // cancelarBtn.parentNode.replaceChild(newCancelarBtn, cancelarBtn);
        // cancelarBtn = newCancelarBtn;
        
        cancelarBtn.addEventListener('click', function() {
            closeAuthPopup();
        });
    }
}

// Función para guardar el perfil del usuario
function guardarPerfilUsuario(cedula, nombre, correo, foto, guardarBtn, cancelarBtn) {
    const originalBtnText = 'Guardar Perfil'; // Guardar texto original
    
    if (!cedula || !nombre || !correo) {
        alert('Por favor completa todos los campos obligatorios');
        // --- REHABILITAR BOTONES EN ERROR --- 
        if (guardarBtn) {
             guardarBtn.disabled = false;
             guardarBtn.textContent = originalBtnText;
        }
        if (cancelarBtn) cancelarBtn.disabled = false;
        // --- FIN REHABILITACIÓN ---
        return;
    }
    
    // Validar correo con expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert('Por favor ingresa un correo electrónico válido');
        // --- REHABILITAR BOTONES EN ERROR --- 
        if (guardarBtn) {
             guardarBtn.disabled = false;
             guardarBtn.textContent = originalBtnText;
        }
        if (cancelarBtn) cancelarBtn.disabled = false;
        // --- FIN REHABILITACIÓN ---
        return;
    }
    
    const datos = {
        cedula: cedula,
        nombre: nombre,
        correo: correo,
        foto: foto
    };
    
    console.log("📡 Enviando datos de perfil:", {...datos, foto: foto ? '(Base64 imagen)' : null});
    
    fetch(`${getBackendUrl()}/actualizar_perfil`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => {
        console.log("📡 Status respuesta actualización perfil:", response.status, response.statusText);
        console.log("📡 Tipo de contenido:", response.headers.get('content-type'));
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error("⚠️ Respuesta no es JSON:", contentType);
            // Si no es JSON, leer como texto y mostrar parte del contenido para diagnóstico
            return response.text().then(text => {
                console.error("Contenido HTML recibido (primeros 500 caracteres):", text.substring(0, 500) + "...");
                console.error("URL completa de la solicitud:", `${getBackendUrl()}/actualizar_perfil`);
                throw new Error('La respuesta del servidor no es JSON válido. Posiblemente el servidor está devolviendo una página HTML de error.');
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log("📡 Respuesta actualización perfil:", data);
        
        if (data.error) {
            alert('❌ Error al actualizar perfil: ' + data.error);
            // --- REHABILITAR BOTONES EN ERROR --- 
            if (guardarBtn) {
                 guardarBtn.disabled = false;
                 guardarBtn.textContent = originalBtnText;
            }
            if (cancelarBtn) cancelarBtn.disabled = false;
            // --- FIN REHABILITACIÓN ---
            return;
        }
        
        if (data.success) {
            // Guardar la información del usuario en localStorage
            localStorage.setItem('nombre', nombre);
            localStorage.setItem('correo', correo);
            // También guardar correo como email para mantener consistencia en otras partes del código
            localStorage.setItem('email', correo);
            
            // Añadir bandera para indicar que el perfil está completo
            localStorage.setItem('perfil_completo', 'true');
            console.log("💾 localStorage: perfil_completo establecido a true.");
            
            // Cerrar el popup
            closeAuthPopup();
            
            // Si estamos en la página de publicidad, configurar el botón de registro
            if (window.configurarBotonRegistro) {
                console.log("✅ Perfil guardado. Configurando botón de registro.");
                window.configurarBotonRegistro();
            } else {
                console.log("✅ Perfil guardado. No se encontró configurarBotonRegistro (quizás no estamos en publicidad.html)");
            }
            
            // --- NO ACTIVAR CHATBOT AQUÍ ---
            // Comentado: Esperar un momento antes de activar el chatbot...
            // setTimeout(() => {
            //     activarChatbot();
            // }, 100);
            console.log("✅ Perfil guardado con éxito. Botón de registro configurado (si aplica). Chatbot NO se activa desde aquí.");
        } else {
            alert('Ha ocurrido un error al actualizar tu perfil. Por favor intenta nuevamente.');
            // --- REHABILITAR BOTONES EN ERROR --- 
            if (guardarBtn) {
                 guardarBtn.disabled = false;
                 guardarBtn.textContent = originalBtnText;
            }
            if (cancelarBtn) cancelarBtn.disabled = false;
            // --- FIN REHABILITACIÓN ---
        }
    })
    .catch(error => {
        console.error('Error al actualizar perfil:', error);
        alert('Error al actualizar perfil: ' + error.message);
        // --- REHABILITAR BOTONES EN ERROR --- 
        if (guardarBtn) {
             guardarBtn.disabled = false;
             guardarBtn.textContent = originalBtnText;
        }
        if (cancelarBtn) cancelarBtn.disabled = false;
        // --- FIN REHABILITACIÓN ---
    });
}

// Función para mostrar el popup de error
function mostrarPopupError() {
    console.log("🚨 Mostrando popup de error...");

    const popupError = document.createElement("div");
    popupError.id = "popup-error";
    popupError.style.position = "fixed";
    popupError.style.top = "50%";
    popupError.style.left = "50%";
    popupError.style.transform = "translate(-50%, -50%)";
    popupError.style.background = "#35a9aa";
    popupError.style.color = "white";
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

    // Ocultar el popup de autenticación si aún existe
    const authPopup = document.getElementById("auth-popup");
    if (authPopup) {
        authPopup.remove();
    }
}

// Función para bloquear el botón en caso de acceso denegado
function bloquearBoton() {
    const chatButton = document.getElementById("chatbot-button");
    if (chatButton) {
        chatButton.style.backgroundColor = "red";
        chatButton.style.color = "white";
        chatButton.style.cursor = "not-allowed";
        chatButton.innerText = "❌ No eres afiliado al sindicato";
        chatButton.disabled = true;

        // Guardar en LocalStorage que falló la validación
        localStorage.setItem("afiliado", "no");
    }
}

// Función para activar el chatbot después de cerrar el popup
function activarChatbot() {
    console.log("🎙️ Activando chatbot con IA...");

    const botonChat = document.getElementById("chatbot-button");
    const linkEstatutos = document.getElementById("estatutos-link");
    const linkEstatutosMobile = document.getElementById("estatutos-link-mobile");
    const linkModulos = document.getElementById("modulos-link");
    const linkAfiliacion = document.getElementById("afiliacion-link");
    const botonFlotante = document.getElementById("boton-flotante");
    const contenedorChatbot = document.getElementById("chatbot-container");
    const registrarBtn = document.getElementById("registrar-publicidad");

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
                    <button class="minimize-chat">_</button>
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

        // Inicializar el chat
        if (window.inicializarChatIA) {
            window.inicializarChatIA();
        } else {
            console.error("La función inicializarChatIA no está disponible");
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
                } else {
                    crearBotonFlotante();
                }
            });
        }

        // Agregar funcionalidad al botón de minimizar
        const minimizeButton = contenedorChatbot.querySelector('.minimize-chat');
        if (minimizeButton) {
            minimizeButton.addEventListener('click', () => {
                // Ocultar el contenedor del chatbot
                contenedorChatbot.style.display = "none";
                
                // Mostrar el botón flotante
                if (botonFlotante) {
                    botonFlotante.style.display = "block";
                } else {
                    // Si no existe el botón flotante, crearlo
                    crearBotonFlotante();
                }
            });
        }
    } else {
        console.error("No se encontró el contenedor del chatbot");
    }

    // Asegurarse de que el botón de registro esté habilitado si el usuario está autenticado
    if (window.configurarBotonRegistro) {
        console.log("🔑 Llamando a configurarBotonRegistro desde activarChatbot");
        window.configurarBotonRegistro();
    } else if (registrarBtn) {
        // Si no está disponible la función pero el botón existe y el usuario está autenticado
        const isUserAuth = localStorage.getItem("afiliado") === "yes";
        const isProfileComplete = localStorage.getItem("perfil_completo") === "true";
        
        if (isUserAuth || isProfileComplete) {
            console.log("🔓 Habilitando botón de registro directamente");
            registrarBtn.disabled = false;
            registrarBtn.classList.remove('boton-deshabilitado');
        }
    }
}

// Función para crear el botón flotante de chat si no existe
function crearBotonFlotante() {
    // Verificar si ya existe
    let botonFlotante = document.getElementById("boton-flotante");
    
    if (!botonFlotante) {
        botonFlotante = document.createElement("div");
        botonFlotante.id = "boton-flotante";
        botonFlotante.className = "chat-flotante";
        botonFlotante.innerHTML = `
            <div class="chat-icon">
                <img src="images/chat-icon.png" alt="Chat" width="40">
            </div>
            <span>Hablar con Elektra</span>
        `;
        
        // Estilos básicos
        botonFlotante.style.position = "fixed";
        botonFlotante.style.bottom = "20px";
        botonFlotante.style.right = "20px";
        botonFlotante.style.backgroundColor = "#35a9aa";
        botonFlotante.style.color = "white";
        botonFlotante.style.padding = "10px 15px";
        botonFlotante.style.borderRadius = "25px";
        botonFlotante.style.display = "flex";
        botonFlotante.style.alignItems = "center";
        botonFlotante.style.gap = "10px";
        botonFlotante.style.cursor = "pointer";
        botonFlotante.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
        botonFlotante.style.zIndex = "9999";
        
        document.body.appendChild(botonFlotante);
        
        // Agregar evento para reabrir el chat
        botonFlotante.addEventListener('click', () => {
            // --- MODIFICADO: Llamar a activarChatbot para abrir E inicializar ---
            console.log("🖱️ Botón flotante clickeado, activando chatbot...");
            activarChatbot(); 
            
            // Ocultar el botón flotante después de activar el chat
            botonFlotante.style.display = "none"; 
        });
    }
    
    // Asegurarse de que el botón esté visible si se acaba de crear o ya existía
    botonFlotante.style.display = "flex";
    return botonFlotante;
}

// Inicializar el botón de chat cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log('Inicializando botón de chat desde auth-popup.js...');
    const chatButton = document.getElementById("chatbot-button");

    // Revisar si el usuario ya falló antes y bloquear botón
    if (localStorage.getItem("afiliado") === "no") {
        console.log('Usuario bloqueado por intentos previos');
        bloquearBoton();
    }

    if (chatButton) {
        console.log('Agregando event listener al botón de chat');
        chatButton.addEventListener("click", function() {
            console.log('Botón de chat clickeado');
            showAuthPopup();
        });
    } else {
        console.error('Botón de chat no encontrado en el DOM');
    }
});

// También intentar inicializar inmediatamente por si el DOM ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM ya cargado, inicializando inmediatamente desde auth-popup.js');
    setTimeout(function() {
        const chatButton = document.getElementById("chatbot-button");
        if (chatButton) {
            console.log('Botón de chat encontrado, agregando event listener');
            chatButton.addEventListener("click", showAuthPopup);
        } else {
            console.error('Botón de chat no encontrado en el DOM (inicialización inmediata)');
        }

        // Comprobar si tenemos cédula guardada pero no perfil completo
        const cedula = localStorage.getItem("cedula");
        const perfilCompleto = localStorage.getItem("perfil_completo");
        
        if (cedula && perfilCompleto !== "true") {
            console.log("🔄 Cédula encontrada pero perfil no marcado como completo, verificando con el backend...");
            // Verificar si el perfil ya existe en el backend
            comprobarPerfilUsuarioEnBackground(cedula);
        }
    }, 100);
}

// Función para verificar y restaurar el chatbot si es necesario
function verificarYRestaurarChatbot() {
    // Verificar si el usuario está autenticado
    const isAuth = localStorage.getItem("afiliado") === "yes" || localStorage.getItem("perfil_completo") === "true";
    
    if (!isAuth) {
        console.log("👤 Usuario no autenticado, no se restaura el chatbot");
        return;
    }
    
    console.log("🔍 Verificando estado del chatbot...");
    
    // Buscar elementos relacionados con el chatbot
    const botonFlotante = document.getElementById("boton-flotante");
    const contenedorChatbot = document.getElementById("chatbot-container");
    
    // Si no hay botón flotante ni contenedor de chatbot visibles, hay que restaurarlos
    const restaurarNecesario = (!botonFlotante || botonFlotante.style.display === "none") && 
                              (!contenedorChatbot || contenedorChatbot.style.display === "none");
                              
    if (restaurarNecesario) {
        console.log("🔄 Restaurando botón flotante del chatbot...");
        // Crear el botón flotante
        crearBotonFlotante();
    } else {
        console.log("✅ Chatbot en estado correcto, no es necesario restaurar");
    }
}

// Ejecutar verificación periódica para asegurar que el botón del chatbot esté disponible
setInterval(verificarYRestaurarChatbot, 2000);

// Exponer funciones globalmente
window.showAuthPopup = showAuthPopup;
window.verifyCedula = verifyCedula;
window.mostrarPopupContrasena = mostrarPopupContrasena;
window.mostrarPopupBienvenida = mostrarPopupBienvenida;
window.mostrarPopupError = mostrarPopupError;
window.bloquearBoton = bloquearBoton;
window.activarChatbot = activarChatbot;

// Función para mostrar el formulario de perfil
function mostrarFormularioPerfil(cedula, nombre) {
    console.log("📋 Mostrando formulario de perfil para cédula:", cedula);
    
    // Guardar datos en localStorage
    localStorage.setItem("cedula", cedula);
    if (nombre) {
        localStorage.setItem("nombre", nombre);
    }
    
    // Cerrar el popup actual si existe
    const existingPopup = document.getElementById("auth-popup");
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Crear el nuevo popup de perfil
    const popup = document.createElement("div");
    popup.id = "auth-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.padding = "20px";
    popup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    popup.style.zIndex = "10000";
    popup.style.borderRadius = "8px";
    popup.style.width = "400px";
    popup.style.textAlign = "center";

    popup.innerHTML = `
        <h3>Completa tu perfil</h3>
        <p>Por favor completa la siguiente información para continuar:</p>
        
        <div id="profile-panel">
            <div style="margin-bottom: 15px;">
                <label for="nombre">Nombre completo:</label>
                <input type="text" id="nombre" value="${nombre || ''}" placeholder="Tu nombre completo">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="correo">Correo electrónico:</label>
                <input type="email" id="correo" placeholder="tu@correo.com">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Foto de perfil:</label>
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 10px;">
                    <img id="user-photo-preview" src="" alt="Foto de perfil" style="width: 100px; height: 100px; border-radius: 50%; border: 1px solid #ccc; object-fit: cover; display: none;">
                    <input type="file" id="user-photo" accept="image/*" style="display: block; margin: 10px auto;">
                </div>
            </div>
            
            <button id="guardar-perfil-btn">Guardar Perfil</button>
            <button id="cancelar-perfil-btn">Cancelar</button>
        </div>
    `;

    document.body.appendChild(popup);
    
    // Obtener correo de localStorage si existe
    const correo = localStorage.getItem("correo");
    if (correo) {
        document.getElementById('correo').value = correo;
    }
    
    // Evento para previsualizar la imagen seleccionada
    document.getElementById('user-photo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('user-photo-preview');
                preview.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Evento para guardar el perfil
    let guardarBtn = document.getElementById('guardar-perfil-btn');
    let cancelarBtn = document.getElementById('cancelar-perfil-btn');
    
    if (guardarBtn) {
        // --- CLONAR PARA LIMPIAR LISTENERS ---
        const newGuardarBtn = guardarBtn.cloneNode(true);
        guardarBtn.parentNode.replaceChild(newGuardarBtn, guardarBtn);
        guardarBtn = newGuardarBtn; // Actualizar la referencia
        // --- FIN CLONADO ---
        
        guardarBtn.addEventListener('click', function() {
            // Deshabilitar botones
            guardarBtn.disabled = true;
            guardarBtn.textContent = 'Guardando...';
            if(cancelarBtn) cancelarBtn.disabled = true;
            
            const nombreValue = document.getElementById('nombre').value;
            const correoValue = document.getElementById('correo').value;
            const fotoPreview = document.getElementById('user-photo-preview');
            const fotoValue = fotoPreview.style.display !== 'none' ? fotoPreview.src : '';
            
            // Pasar la referencia correcta del botón
            guardarPerfilUsuario(cedula, nombreValue, correoValue, fotoValue, guardarBtn, cancelarBtn);
        });
    }
    
    // Evento para cancelar (podría necesitar clonado similar si la función se llama múltiples veces)
    if (cancelarBtn) {
        // Opcional: Clonar y reemplazar cancelarBtn si es necesario
        // const newCancelarBtn = cancelarBtn.cloneNode(true);
        // cancelarBtn.parentNode.replaceChild(newCancelarBtn, cancelarBtn);
        // cancelarBtn = newCancelarBtn;
        
        cancelarBtn.addEventListener('click', function() {
            closeAuthPopup();
        });
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    console.error("❌ Error:", mensaje);
    alert(mensaje);
}

// Función auxiliar para obtener la URL del backend
function getBackendUrl() {
    // Verificar primero si hay una URL base definida en window.API_ENDPOINTS
    if (window.API_ENDPOINTS && window.API_ENDPOINTS.base) {
        console.log("📡 Usando API_ENDPOINTS.base:", window.API_ENDPOINTS.base);
        return window.API_ENDPOINTS.base;
    }
    
    // Si no hay base pero hay URL de publicidad, extraer la base de ella
    if (window.API_ENDPOINTS && window.API_ENDPOINTS.publicidad) {
        // Extraer la base quitando "/api/publicidad" del final
        const url = window.API_ENDPOINTS.publicidad;
        const baseUrl = url.replace(/\/api\/publicidad$/, '');
        console.log("📡 Extrayendo base de API_ENDPOINTS.publicidad:", baseUrl);
        return baseUrl;
    }
    
    // Usar la URL de ngrok desde config.js si está disponible
    if (window.BACKEND_URL) {
        console.log("📡 Usando BACKEND_URL global:", window.BACKEND_URL);
        return window.BACKEND_URL;
    }
    
    // Usar una URL definida localmente como respaldo
    const urlNgrok = "https://d01c-2800-484-8786-7d00-a958-9ef1-7e9c-89b9.ngrok-free.app";
    console.log("📡 Usando URL de respaldo:", urlNgrok);
    
    // Valor por defecto como última opción
    return urlNgrok;
}

// Nueva función para comprobar el perfil en el backend sin mostrar UI
function comprobarPerfilUsuarioEnBackground(cedula) {
    console.log("🔍 Comprobando perfil en background para cédula:", cedula);
    
    // Obtener datos del perfil del usuario desde el backend
    fetch(`${getBackendUrl()}/obtener_perfil`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula })
    })
    .then(response => {
        if (!response.ok) return null;
        return response.json();
    })
    .then(data => {
        if (!data) return;
        
        console.log("📡 Datos de perfil recibidos en background:", data);
        
        if (data.perfil_completo) {
            // Guardar información en localStorage
            localStorage.setItem('perfil_completo', 'true');
            
            // Guardar los datos del usuario en localStorage
            if (data.datos) {
                if (data.datos.nombre) localStorage.setItem('nombre', data.datos.nombre);
                if (data.datos.correo) {
                    localStorage.setItem('correo', data.datos.correo);
                    localStorage.setItem('email', data.datos.correo);
                }
                if (data.datos.foto_ruta) localStorage.setItem('foto_ruta', data.datos.foto_ruta);
            }
            
            console.log("✅ Perfil completo encontrado en el backend, datos guardados en localStorage");
            
            // Si estamos en la página de publicidad, reconfigurar el botón
            if (window.configurarBotonRegistro) {
                console.log("🔄 Reconfigurando botón de registro después de verificar perfil");
                window.configurarBotonRegistro();
            }
        }
    })
    .catch(error => {
        console.error('Error al comprobar perfil en background:', error);
    });
}
