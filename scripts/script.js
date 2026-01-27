// ===== URL do Backend ===== //
const API_URL = "https://sheep-adops.vercel.app/verificar";
//const API_URL = "http://127.0.0.1:8000/verificar"//

// ===== Elementos DOM ===== //
const form = document.getElementById("form-url-param");
const urlTextarea = document.getElementById("txt_url");
const paramTextarea = document.getElementById("txt_parameter");
const paramCheckbox = document.getElementById("ipt_saveParameter");
const tabelinha = document.querySelector("#results_body");
const warningBox = document.getElementById("aviso_url");
const btnVerificar = document.getElementById("btn_verificar");
const tabela = document.querySelector("table");

const MAX_URLS = 120;

// ===== Verificar Parametros Salvos ===== //
document.addEventListener("DOMContentLoaded", () => {
    // --- Verifica CheckboxState - Checked --- //
    const checkboxState = localStorage.getItem("savedCheckboxState");

    if (checkboxState === "true") {
        paramCheckbox.checked = true;

        // --- Carregar os parametros (caso salvos) --- //
        const savedParams = localStorage.getItem("savedParams");
        if (savedParams) {
            paramTextarea.value = savedParams
        }
    }

    // --- Salvar estado checkbox --- //
    paramCheckbox.addEventListener("change", () => {
        localStorage.setItem("savedCheckboxState", paramCheckbox.checked);
        localStorage.setItem("savedParams", paramTextarea.value); // Salvar parametros ja preenchidos!

        // --- Desmarcado remove itens salvos --- //
        if (!paramCheckbox.checked) {
            localStorage.removeItem("savedParams");
        }
    });

    // --- Salvar parametros (caso Checked) --- //
    paramTextarea.addEventListener("input", () => {
        if (paramCheckbox.checked) {
            localStorage.setItem("savedParams", paramTextarea.value);
        }
    });
});

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

    // --- Verificar checkbox - salvar parametros --- //
    if (paramCheckbox.chedcked) {
        localStorage.setItem("savedParams", paramTextarea.value);
        localStorage.setItem("savedCheckboxState", paramCheckbox.checked);
    }

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
    let recebeuAlgum = false;

    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls, parametros })
        });

        if (response.status === 204) {
            tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado.</td></tr>`;
            return;
        }

        const reader = response.body.getReader();   // ---> Inicia o leitor do fluxo de dados da resposta
        const decoder = new TextDecoder();          // ---> Cria o decodificador para transformar bytes em texto
        let buffer = "";                            // ---> Servir de armazen temporario para pedaços de texto incompletos

        while(true) {
            const { value, done } = await reader.read();
            if (done) break;

            // --- Decodifica o novo e junta com o que ja estava no buffer --- //
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split("\n");

            // --- Manter a ultima linha no buffer caso não esteja completa --- //
            buffer = lines.pop();

            for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine || cleanLine === ":" || cleanLine === "") continue;

                try {
                    const data = JSON.parse(cleanLine);

                    // --- Primeiro resultado valido limpa o Spinner --- //
                    if (!recebeuAlgum) {
                        tabelinha.innerHTML = "";
                        recebeuAlgum = true;
                    }

                    appendRow(data);
                } catch (e) {
                    // --- Ignorar linhas que não são JSON (tipo yield "") --- //
                    continue;
                }
            }
        }
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
