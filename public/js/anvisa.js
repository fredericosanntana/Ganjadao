document.addEventListener("DOMContentLoaded", function() {
    const anvisaForm = document.getElementById("anvisaForm");
    const previewBtn = document.getElementById("previewBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const emailSubmitBtn = document.getElementById("emailSubmitBtn");
    const previewContent = document.getElementById("previewContent");
    const createManifestationBtn = document.getElementById("createManifestationBtn");
    const generatePdfBtn = document.getElementById("generatePdfBtn");
    const sendEmailBtn = document.getElementById("sendEmailBtn");
    const manifestationFormSection = document.getElementById("manifestationForm");

    // Mostrar formulário ao clicar em "Criar Manifestação"
    if (createManifestationBtn) {
        createManifestationBtn.addEventListener("click", function() {
            manifestationFormSection.style.display = "block";
            // Rolar para o formulário
            manifestationFormSection.scrollIntoView({ behavior: "smooth" });
        });
    }

    // Funções auxiliares para os botões principais (se necessário)
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener("click", function() {
            manifestationFormSection.style.display = "block";
            manifestationFormSection.scrollIntoView({ behavior: "smooth" });
            // Adicionar lógica para focar no botão de download do formulário ou acioná-lo
        });
    }

    if (sendEmailBtn) {
        sendEmailBtn.addEventListener("click", function() {
            manifestationFormSection.style.display = "block";
            manifestationFormSection.scrollIntoView({ behavior: "smooth" });
            // Adicionar lógica para focar no botão de envio de email do formulário ou acioná-lo
        });
    }

    function getFormData() {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const cpf = document.getElementById("cpf").value;
        const profession = document.getElementById("profession").value;
        const additionalComments = document.getElementById("additionalComments").value;

        // Coletar pontos selecionados
        const points = {};
        document.querySelectorAll(".form-check-input").forEach(input => {
            points[input.id] = input.checked;
        });

        return {
            name,
            email,
            cpf,
            profession,
            additionalComments,
            // Mapear os IDs dos checkboxes para os nomes esperados pelo backend
            includeAutocultivo: points.point1 || false,
            includeJurisprudencia: points.point2 || false,
            includeAssociacoes: points.point3 || false, // Assumindo que point3 é associações
            includeInNatura: points.point4 || false,
            includeAcesso: points.point5 || false, // Assumindo que point5 é acesso/redução de custos
            // Adicionar um tipo de manifestação default ou permitir seleção
            manifestationType: "individual" 
        };
    }

    function showToast(message, type = "success") {
        const toastContainer = document.querySelector(".toast-container") || document.createElement("div");
        if (!document.querySelector(".toast-container")) {
            toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
            toastContainer.style.zIndex = "1055";
            document.body.appendChild(toastContainer);
        }

        const toastId = `toast-${Date.now()}`;
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === "error" ? "danger" : "success"} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML("beforeend", toastHTML);
        const toastElement = new bootstrap.Toast(document.getElementById(toastId));
        toastElement.show();
    }

    if (previewBtn) {
        previewBtn.addEventListener("click", async function() {
            const formData = getFormData();
            previewBtn.disabled = true;
            previewBtn.innerHTML = 
                `<span class="loading-spinner" role="status" aria-hidden="true"></span> Atualizando...`;

            try {
                const response = await fetch("/anvisa/preview", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (result.success) {
                    previewContent.innerHTML = result.text.replace(/\n/g, "<br>");
                } else {
                    previewContent.innerHTML = `<p class="text-danger">Erro: ${result.message || "Não foi possível gerar a prévia."}</p>`;
                    if (result.errors) {
                        previewContent.innerHTML += "<ul>" + result.errors.map(err => `<li>${err.msg}</li>`).join("") + "</ul>";
                    }
                }
            } catch (error) {
                previewContent.innerHTML = `<p class="text-danger">Erro ao conectar com o servidor: ${error.message}</p>`;
            }
            previewBtn.disabled = false;
            previewBtn.innerHTML = "Atualizar Prévia";
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", async function() {
            const formData = getFormData();
            downloadPdfBtn.disabled = true;
            downloadPdfBtn.innerHTML = 
                `<span class="loading-spinner" role="status" aria-hidden="true"></span> Gerando PDF...`;

            try {
                const response = await fetch("/anvisa/download", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const filenameHeader = response.headers.get("content-disposition");
                    let filename = "manifestacao_anvisa.pdf";
                    if (filenameHeader) {
                        const parts = filenameHeader.split("filename=");
                        if (parts.length > 1) {
                            filename = parts[1].split(";")[0].replace(/"/g, "");
                        }
                    }
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast("PDF gerado e download iniciado!");
                } else {
                    const result = await response.json();
                    showToast(`Erro ao gerar PDF: ${result.message || response.statusText}`, "error");
                }
            } catch (error) {
                showToast(`Erro ao conectar com o servidor: ${error.message}`, "error");
            }
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.innerHTML = "Baixar PDF";
        });
    }

    if (emailSubmitBtn) {
        emailSubmitBtn.addEventListener("click", async function() {
            const formData = getFormData();
            emailSubmitBtn.disabled = true;
            emailSubmitBtn.innerHTML = 
                `<span class="loading-spinner" role="status" aria-hidden="true"></span> Enviando...`;

            try {
                const response = await fetch("/anvisa/enviar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (result.success) {
                    showToast(result.message || "E-mail enviado com sucesso!");
                } else {
                    showToast(`Erro ao enviar e-mail: ${result.message || "Verifique os dados e tente novamente."}`, "error");
                }
            } catch (error) {
                showToast(`Erro ao conectar com o servidor: ${error.message}`, "error");
            }
            emailSubmitBtn.disabled = false;
            emailSubmitBtn.innerHTML = "Enviar por E-mail";
        });
    }
});
