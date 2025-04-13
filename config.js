// Configuración del backend
window.BACKEND_URL = 'https://c8c3-2800-484-8786-7d00-bd7e-12fa-195d-a987.ngrok-free.app';
window.DEBUG_MODE = false;
window.LOCAL_URL = 'http://localhost:8000';

// URL efectiva a usar
const EFFECTIVE_URL = window.DEBUG_MODE ? window.LOCAL_URL : window.BACKEND_URL;

// Configuración de endpoints
window.API_ENDPOINTS = {
    base: EFFECTIVE_URL,
    publicidad: `${EFFECTIVE_URL}/api/publicidad`,
    verificarCedula: `${EFFECTIVE_URL}/api/verificar_cedula`,
    meGusta: `${EFFECTIVE_URL}/api/me-gusta`,
    usuario: `${EFFECTIVE_URL}/api/usuario`
};

// Test de configuración
console.log('🔧 Configuración cargada:', {
    BACKEND_URL: window.BACKEND_URL,
    DEBUG_MODE: window.DEBUG_MODE,
    API_ENDPOINTS: window.API_ENDPOINTS
});

// Función para enviar formulario de afiliación por correo
async function enviarFormularioAfiliacion(pdfData, emailDestino) {
    try {
        console.log("📧 Enviando formulario a:", emailDestino || 'daniel.rr93g@gmail.com');
        
        // Usar el endpoint de publicidad que sabemos que funciona
        // y tiene la funcionalidad de enviar correos
        const response = await fetch(API_ENDPOINTS.publicidad, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'enviar_correo',
                destinatario: 'daniel.rr93g@gmail.com', // Siempre enviar a Daniel
                cc_destinatario: emailDestino, // Con copia al usuario si proporcionó email
                asunto: 'Nuevo formulario de afiliación',
                mensaje: `
                    <h2>Nuevo formulario de afiliación recibido</h2>
                    <p>Se ha recibido un nuevo formulario de afiliación con los siguientes datos:</p>
                    <pre>${JSON.stringify(pdfData, null, 2)}</pre>
                    <p>Por favor, revisa y procesa esta solicitud.</p>
                `
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("✅ Resultado del envío:", result);
        return result;
    } catch (error) {
        console.error('❌ Error al enviar formulario de afiliación:', error);
        return { error: error.message };
    }
}

// Exportar las claves y URLs para uso en otros archivos
window.API_KEYS = API_KEYS;
window.BACKEND_URL = BACKEND_URL;
window.API_ENDPOINTS = API_ENDPOINTS;
window.enviarFormularioAfiliacion = enviarFormularioAfiliacion;

