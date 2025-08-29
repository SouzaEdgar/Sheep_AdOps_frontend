// ===== URL do Backend ===== //
const API_URL = "https://sheep-adops.vercel.app/verificar";//const API_URL = "http://127.0.0.1:8000/verificar"//

// ===== Elementos DOM ===== //
const form = document.getElementById("form-url-param");
const urlTextarea = document.getElementById("txt_url");
const paramTextarea = document.getElementById("txt_parameter");
const tabelinha = document.querySelector("#results_body");
const warningBox = document.getElementById("aviso_url");
const btnVerificar = document.getElementById("btn_verificar");
const tabela = document.querySelector("table");

const MAX_URLS = 150;

// ===== Validação quantidade URLs ===== //
urlTextarea.addEventListener("input", () => {
    const urls = urlTextarea.value.split("\n").filter(u => u.trim());
    if (urls.length > MAX_URLS) {
        warningBox.style.display = "block";
        warningBox.textContent = `Só é permitido ${MAX_URLS} URLs por vez.`;
        btnVerificar.disabled = true;
        btnVerificar.classList.add("disabled");
    } else {
        warningBox.style.display = "none";
        btnVerificar.disabled = false;
        btnVerificar.classList.remove("disabled");
    }
});

// ===== Submit Formulario (URLs / Parametros) ===== //
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const urls = urlTextarea.value.split("\n").filter(u => u.trim());
    const parametros = paramTextarea.value.split("\n").filter(p => p.trim());

    // --- Exibir UP/Down e Cabeçalho --- //
    document.getElementById("btns_container").className = "";
    document.querySelector("thead").style.display = "flex";

    // --- Exibir loading --- //
    tabelinha.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                <div class="spinner"></div>
                <div>Processando...</div>
            </td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls, parametros })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        const resultados = Array.isArray(data.resultados) ? data.resultados : [];

        if (resultados.length === 0) {
            tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado encontrado.</td></tr>`;
            return;
        }

        // ===== Preencher tabela ===== //
        tabelinha.innerHTML = resultados.map(r => {
            const paramsHTML = r.params?.map(p => `<li><b>${p.param}:</b> ${p.valor}</li>`).join("") || "";
            return `
                <tr class="linha-resultado">
                    <td class="position">${r.position}</td>
                    <td class="urls"><a href="${r.url}" target="_blank">${r.url}</a></td>
                    <td class="params"><ul>${paramsHTML}</ul></td>
                    <td class="status">${r.status}</td>
                </tr>
            `;
        }).join("");

        // --- Scroll até a tabela --- //
        tabela.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (error) {
        tabelinha.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:red;">
                    Ocorreu um erro: ${error.message}
                </td>
            </tr>
        `;
    }
});

// ===== Botôes - UP/DOWN ===== //
document.getElementById("btn_up").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("btn_down").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "end" });
});

