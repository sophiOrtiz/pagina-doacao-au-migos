document.addEventListener('DOMContentLoaded', function() {

    const donationForm = document.getElementById('donation-form');
    const valorButtons = document.querySelectorAll('.campo-valores button');
    const outroValorInput = document.getElementById('outro-valor');
    const feedbackMessage = document.getElementById('feedback-message');
    const pagamentoSelect = document.getElementById('pagamento');
    const cardFieldsDiv = document.getElementById('card-fields');


    const numeroCartaoInput = document.getElementById('numero-cartao');
    const validadeCartaoInput = document.getElementById('validade-cartao');
    const cvvInput = document.getElementById('cvv');


    const pixFieldsDiv = document.getElementById('pix-fields');
    const pixCodeInput = document.getElementById('pix-code');
    const copyPixBtn = document.getElementById('copy-pix-btn');
    const copyFeedback = document.getElementById('copy-feedback');


    let valorDoacaoSelecionado = 0; 
    function maskCardNumber(value) {
        value = value.replace(/\D/g, ''); 
        value = value.replace(/(\d{4})/g, '$1 ').trim(); 
        return value.substring(0, 19);
    }

    function maskExpiryDate(value) {
        value = value.replace(/\D/g, ''); 
        value = value.replace(/^(\d{2})(\d)/g, '$1/$2'); 
        return value.substring(0, 5);
    }

    function maskCVV(value) {
        value = value.replace(/\D/g, ''); 
        return value.substring(0, 4);
    }

    function maskCurrency(value) {
        value = String(value).replace(/\D/g, ''); 

        if (value === '') {
            valorDoacaoSelecionado = 0;
            return '';
        }


        let number = parseFloat(value) / 100;
        

        let formattedValue = number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

 
        valorDoacaoSelecionado = number;

        return formattedValue;
    }

    outroValorInput.addEventListener('keydown', (e) => {
    
        if (e.key === 'Backspace' || e.key === 'Delete') {
            return;
        }
      
        if (e.key.startsWith('Arrow')) {
            return;
        }
        
        if (e.key.length === 1 && /\D/.test(e.key)) {
            e.preventDefault();
        }
    });

    outroValorInput.addEventListener('input', (e) => {
        e.target.value = maskCurrency(e.target.value);
        clearButtons(); 
    });

    function clearButtons() {
        valorButtons.forEach(btn => btn.classList.remove('selected'));
    }

    valorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            clearButtons();
            button.classList.add('selected');
            
            valorDoacaoSelecionado = parseFloat(button.getAttribute('data-valor'));
            
            outroValorInput.value = ''; 
        });
    });

    pagamentoSelect.addEventListener('change', () => {
        const metodo = pagamentoSelect.value;
        
        cardFieldsDiv.style.display = 'none';
        pixFieldsDiv.style.display = 'none';
        
        cardFieldsDiv.querySelectorAll('input').forEach(input => input.value = '');
       
        if (metodo === 'Cartao' || metodo === 'Debito') {
            cardFieldsDiv.style.display = 'flex'; 
            cardFieldsDiv.style.flexDirection = 'column';
        } else if (metodo === 'PIX') {
            pixFieldsDiv.style.display = 'block';
        }
    });

    copyPixBtn.addEventListener('click', () => {
        pixCodeInput.select();
        pixCodeInput.setSelectionRange(0, 99999); 
        
        navigator.clipboard.writeText(pixCodeInput.value)
        .then(() => {
            copyFeedback.textContent = 'Código PIX copiado com sucesso!';
            copyFeedback.style.color = '#66BB6A'; 
        })
        .catch(err => {
            console.error('Falha ao copiar:', err);
            copyFeedback.textContent = 'Falha ao copiar. Tente selecionar o código manualmente.';
            copyFeedback.style.color = 'red';
        });

        setTimeout(() => {
            copyFeedback.textContent = '';
        }, 3000);
    });

    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackMessage.style.display = 'block';
        feedbackMessage.style.color = 'red';
        feedbackMessage.textContent = ''; 

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const pagamento = pagamentoSelect.value;
        const mensagem = document.getElementById('mensagem').value.trim(); // <-- NOVO

        if (valorDoacaoSelecionado <= 0) {
            feedbackMessage.textContent = 'Por favor, selecione ou digite um valor para a doação.';
            return;
        }

        if (nome === '' || email === '' || pagamento === '') {
            feedbackMessage.textContent = 'Por favor, preencha nome, e-mail e método de pagamento.';
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            feedbackMessage.textContent = 'Por favor, insira um e-mail válido.';
            return;
        }

        const isCardPayment = (pagamento === 'Cartao' || pagamento === 'Debito');

        if (isCardPayment) {
            const numeroCartao = numeroCartaoInput.value.trim().replace(/\s/g, '');
            const nomeCartao = document.getElementById('nome-cartao').value.trim();
            const validadeCartao = validadeCartaoInput.value.trim();
            const cvv = cvvInput.value.trim().replace(/\D/g, ''); 

            if (numeroCartao.length < 15 || nomeCartao === '' || validadeCartao.length !== 5 || cvv.length < 3) {
                feedbackMessage.textContent = 'Por favor, preencha todos os dados válidos do cartão (Número, Nome, Validade e CVV).';
                return;
    }
}

        feedbackMessage.style.color = 'orange'; 
        feedbackMessage.textContent = 'Enviando doação para processamento...';
        donationForm.querySelector('.submit-button').disabled = true;

        const data = {
            nome: nome,
            email: email,
            valor: valorDoacaoSelecionado.toFixed(2), 
            pagamento: pagamento,
            mensagem: mensagem, 
            
            ...(isCardPayment && {
                numeroCartao: numeroCartaoInput.value.trim(),
                validade: validadeCartaoInput.value.trim(),
                cvv: cvvInput.value.trim()
            })
        };

        fetch('http://localhost:3000/doar', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), 
        })
        .then(response => response.json()) 
        .then(data => {
            donationForm.querySelector('.submit-button').disabled = false;
            feedbackMessage.style.display = 'block';

           // ...
            if (data.success) {
                feedbackMessage.style.color = '#66BB6A'; 
                feedbackMessage.textContent = data.message;
                
                if (data.redirectUrl) {
                    const nomeCodificado = encodeURIComponent(data.nomeDoador);
                    const valorCodificado = encodeURIComponent(data.valorDoado);
                    const urlDeFeedback = `${data.redirectUrl}?nome=${nomeCodificado}&valor=${valorCodificado}`;
                    
                    setTimeout(() => {
                        window.location.href = urlDeFeedback; 
                    }, 1500); 
                } else {
                    donationForm.reset();
                    clearButtons(); 
                    valorDoacaoSelecionado = 0;
                    cardFieldsDiv.style.display = 'none'; 
                    pixFieldsDiv.style.display = 'none'; 
                }
            } else {
                feedbackMessage.style.color = 'red';
                feedbackMessage.textContent = `Falha na Doação: ${data.message}`;
            }
        })
        .catch((error) => {
            console.error('Erro na requisição:', error);
            donationForm.querySelector('.submit-button').disabled = false;
            feedbackMessage.style.color = 'red';
            feedbackMessage.textContent = 'Erro ao conectar com o servidor. Verifique se o back-end está rodando (Node.js).';
        });

    });
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});