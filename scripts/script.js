// ===== URL do Backend ===== //
const LOCAL = true; // passar para false (hospedado)
const API_URL = LOCAL
    ? "http://127.0.0.1:8000/verificar"              // localhost
    : "https://sei-la-oq-escrever.app.seila/verificar";// hospedado

document.getElementById("form-url-param").addEventListener("submit", async function(event) {
    event.preventDefault(); // impede a página de recarregar

    const formData = new FormData(this);

    // --- Cabeçalho e Botões (.apagar off) --- //
    document.querySelector("thead").className = "";
    document.getElementById("btns-container").style.display = "flex";
    const tabelinha = document.querySelector("#results_body");

    // --- Loading da Tabela --- //
    tabelinha.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                <div class="spinner"></div>
                <div>Processando...</div>
            </td>
        </tr>
    `;

    try {
        // --- Requisição - backend --- //
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // --- recebe JSON --- //
        const resultados = await response.json();

        if (resultados.length === 0) {
            tabelinha.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        Nenhum resultado encontrado.
                    </td>
                </tr>
            `;
        } else {
            // --- Tabelinha --- //
                        tabelinha.innerHTML = resultados.map(r => `
                <tr class="linha-resultado">
                    <td class="position">${r.position}</td>
                    <td class="urls"><a href="${r.url}" target="_blank">${r.url}</a></td>
                    <td class="params">${r.params}</td>
                    <td class="status">${r.status}</td>
                </tr>
            `).join("");
        }

        // move a tela para tabela
        const tabela = document.querySelector("table");
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
const tabela = document.querySelector("table");

document.getElementById("btn_up").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "start" });
})
document.getElementById("btn_down").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "start" });
})

