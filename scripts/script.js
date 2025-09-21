// ===== URL do Backend ===== //
const API_URL = "https://sheep-adops.vercel.app/verificar";
//const API_URL = "http://127.0.0.1:8000/verificar"//

// ===== Elementos DOM ===== //
const form = document.getElementById("form-url-param");
const urlTextarea = document.getElementById("txt_url");
const paramTextarea = document.getElementById("txt_parameter");
const tabelinha = document.querySelector("#results_body");
const warningBox = document.getElementById("aviso_url");
const btnVerificar = document.getElementById("btn_verificar");
const tabela = document.querySelector("table");

const MAX_URLS = 120;

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
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const urls = urlTextarea.value.split("\n").filter(u => u.trim());
    const parametros = paramTextarea.value.split("\n").filter(p => p.trim());

    // --- Exibir UP/Down e Cabeçalho --- //
    document.getElementById("btns_container").style.display = "flex";
    document.querySelector("thead").className = "";

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

        if (!response.ok && response.status !== 204) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        tabelinha.innerHTML = ""; // limpa loading

        // Nada para processar (204)
        if (response.status === 204) {
            tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado.</td></tr>`;
            return;
        }
        if (!response.ok && response.status !== 204) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Leitura streaming NDJSON
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let recebeuAlgum = false;

        const appendRow = (r) => {
            recebeuAlgum = true;
            const paramsHTML = (r.params || [])
                .map(p => `<li><b>${p.param}:</b> ${p.valor}</li>`).join("");
            const pos = document.querySelectorAll("#results_body .linha-resultado").length + 1;
            tabelinha.insertAdjacentHTML("beforeend", `
            <tr class="linha-resultado">
            <td class="position">${pos}</td>
            <td class="urls"><a href="${r.url}" target="_blank" rel="noopener">${r.url}</a></td>
            <td class="params"><ul>${paramsHTML}</ul></td>
            <td class="status">${r.status}</td>
            </tr>
        `);
        };

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx;
            // processa linha a linha
            while ((idx = buffer.indexOf("\n")) >= 0) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);

                if (!line) continue;              // ignora keep-alive
                if (line === '{"done": true}') {
                    if (!recebeuAlgum) {
                        tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado.</td></tr>`;
                    }
                    continue;
                }

                try {
                    const obj = JSON.parse(line);
                    appendRow(obj);
                } catch (e) {
                    // linha incompleta / ruído — ignora
                    console.warn("NDJSON parse skip:", line);
                }
            }
        }

        tabela.scrollIntoView({ behavior: "smooth", block: "start" });

        // if (!tabelinha.children.length) {
        //     tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado</td></tr>`;
        // }
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

