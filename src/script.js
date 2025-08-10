/**
 * Clase Calculadora - Maneja la lógica y operaciones de una calculadora básica
 */
class Calculadora {
    /**
     * Constructor de la clase Calculadora
     * @param {HTMLElement} valorPrevioTextElement - Elemento HTML que muestra el valor previo
     * @param {HTMLElement} valorActualTextElement - Elemento HTML que muestra el valor actual
     */
    constructor(valorPrevioTextElement, valorActualTextElement) {
        this.valorPrevioTextElement = valorPrevioTextElement;
        this.valorActualTextElement = valorActualTextElement;
        this.borrarTodo();
        this.MAX_DIGITOS = 9; // LÍMITE DE DÍGITOS 
        this.operacionRealizada = false; // NUEVO: PARA CONTROLAR COMPORTAMIENTO POST-CÁLCULO
    }

    /**
     * Limpia todos los valores de la calculadora, resetea a estado inicial
     */
    borrarTodo() {
        this.valorActual = '0';
        this.valorPrevio = '';
        this.operacion = undefined;
        this.operacionCompleta = '';
        this.operacionRealizada = false;
    }

    /**
     * Elimina el último dígito del valor actual
     */
    borrar() {
        if (this.valorActual.length === 1 || (this.valorActual.length === 2 && this.valorActual.startsWith('-'))) {
            this.valorActual = '0';
        } else {
            this.valorActual = this.valorActual.slice(0, -1);
        }
        this.operacionRealizada = false;
        if (this.operacion) {
            this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`;
        }
    }

    /**
     * Agrega un número (dígito) al valor actual que se está ingresando
     * @param {string} numero - El dígito o punto decimal a agregar
     */
    agregarNumero(numero) {
        if (this.operacionRealizada && this.operacion === undefined) {
            this.borrarTodo();
        }

        // Límite mejorado: contar dígitos antes y después del decimal por separado
        const hasDecimal = this.valorActual.includes('.');
        const [integerPart, decimalPart] = this.valorActual.split('.');
        const integerDigits = integerPart.replace(/[^0-9]/g, '').length;
        const decimalDigits = decimalPart ? decimalPart.length : 0;

        if (numero === '.') {
            if (hasDecimal) return;
            if (this.valorActual === '0') {
                this.valorActual = '0.';
            } else {
                this.valorActual += '.';
            }
            this.operacionRealizada = false;
            if (this.operacion) {
                this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`;
            }
            return;
        }

        // No agregar si excede límites
        if (integerDigits >= this.MAX_DIGITOS && !hasDecimal) return;
        if (hasDecimal && decimalDigits >= 8) return; // Límite de 8 decimales

        if (this.valorActual === '0' && numero !== '.') {
            this.valorActual = numero;
        } else {
            this.valorActual += numero;
        }
        
        this.operacionRealizada = false;
        if (this.operacion) {
            this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`;
        }
    }

    /**
     * Cambia el signo del valor actual
     */
    cambiarSigno() {
        if (this.valorActual === '0') return;
        this.valorActual = this.valorActual.startsWith('-') ? 
            this.valorActual.slice(1) : 
            '-' + this.valorActual;
        if (this.operacion) {
            this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)}`;
        }
    }

    /**
     * Calcula el porcentaje con comportamiento contextual:
     * - En operaciones: porcentaje del primer número para +/-, porcentaje directo para ×/÷
     * - Sin operación: divide por 100
     */
    calcularPorcentaje() {
        if (this.valorActual === '0') return;
        
        const valorActual = parseFloat(this.valorActual);
        
        if (this.operacion && this.valorPrevio) {
            const valorPrevio = parseFloat(this.valorPrevio);
            // NUEVO: COMPORTAMIENTO CONTEXTUAL PARA PORCENTAJES
            switch (this.operacion) {
                case '+':
                case '-':
                case '−':
                    this.valorActual = (valorPrevio * valorActual / 100).toString();
                    break;
                case '×':
                case '÷':
                    this.valorActual = (valorActual / 100).toString();
                    break;
            }
            // NUEVO: ACTUALIZA LA OPERACIÓN COMPLETA CON EL PORCENTAJE
            this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)} (${this.obtenerNumero(this.valorActual)}%)`;
        } else {
            // MODO SIMPLE: CONVERSIÓN A PORCENTAJE
            this.valorActual = (valorActual / 100).toString();
            this.operacionCompleta = `${this.obtenerNumero(this.valorActual)}%`;
        }
    }

    /**
     * Selecciona la operación matemática a realizar
     * @param {string} operacion - El símbolo de la operación (+, -, ×, ÷)
     */
    elegirOperacion(operacion) {
        if (this.valorActual === '0' && this.valorPrevio === '') return;

        // NUEVO: ACTUALIZA LA OPERACIÓN COMPLETA
        this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio || this.valorActual)} ${operacion}`;

        if (this.valorPrevio !== '') {
            this.calcular();
        }

        this.operacion = operacion;
        this.valorPrevio = this.valorActual;
        this.valorActual = '0';
        this.operacionRealizada = false;
    }

    /**
     * Realiza el cálculo matemático según la operación seleccionada
     */
    calcular() {
        const previo = parseFloat(this.valorPrevio);
        const actual = parseFloat(this.valorActual);

        if (isNaN(previo) || isNaN(actual)) return;

        // Actualizar operacionCompleta antes de calcular y limpiar
        this.operacionCompleta = `${this.obtenerNumero(this.valorPrevio)} ${this.operacion} ${this.obtenerNumero(this.valorActual)} =`;

        let resultado;
        switch (this.operacion) {
            case '+':
                resultado = previo + actual;
                break;
            case '−':
                resultado = previo - actual;
                break;
            case '×':
                resultado = previo * actual;
                break;
            case '÷':
                if (actual === 0) {
                    resultado = NaN; // Para mostrar error abajo
                    this.valorActual = 'Error';
                    this.operacionCompleta = 'No se puede dividir por 0';
                    this.operacion = undefined;
                    this.valorPrevio = '';
                    this.operacionRealizada = true;
                    return;
                }
                resultado = previo / actual;
                break;
            default:
                return;
        }

        this.valorActual = this.formatearResultado(resultado);
        this.operacion = undefined;
        this.valorPrevio = '';
        this.operacionRealizada = true;
    }

    /**
     * Formatea el resultado para mostrarlo correctamente
     * @param {number} resultado - Resultado de la operación
     * @returns {string} - Resultado formateado como string
     */
    formatearResultado(resultado) {
        if (isNaN(resultado)) return 'Error';
        if (!isFinite(resultado)) return 'Infinity';

        const absResultado = Math.abs(resultado);
        let resultadoStr;

        if (absResultado >= 1e9 || (absResultado > 0 && absResultado < 1e-6)) {
            resultadoStr = resultado.toExponential(6).replace(/\.?0+e/, 'e').replace(/e\+?/, 'e');
        } else {
            resultadoStr = resultado.toString();
            if (resultadoStr.includes('.')) {
                const partes = resultadoStr.split('.');
                if (partes[1].length > 8) {
                    resultadoStr = resultado.toFixed(8);
                }
            }
            resultadoStr = resultadoStr.replace(/\.?0+$/, '');
        }

        return resultadoStr;
    }

    /**
     * Formatea un número para mostrarlo en pantalla con separadores de miles
     * @param {string} numero - El número a formatear (como string)
     * @returns {string} - El número formateado como string
     */
    obtenerNumero(numero) {
        if (numero === '' || numero === undefined) return '';
        
        const [enteroStr, decimalStr] = numero.split('.');
        let enteroNum = parseFloat(enteroStr);
        
        if (isNaN(enteroNum)) return '';
        
        let parteEntera = enteroNum.toLocaleString('en', { maximumFractionDigits: 0 });
        
        if (decimalStr !== undefined) {
            return `${parteEntera}.${decimalStr}`;
        }
        
        return parteEntera;
    }

    /**
     * Actualiza la pantalla de la calculadora con los valores actuales
     */
    actualizarPantalla() {
        // NUEVO: MUESTRA LA OPERACIÓN COMPLETA EN PANTALLA SUPERIOR
        this.valorPrevioTextElement.innerText = this.operacionCompleta;
        
        // NUEVO: MEJOR MANEJO DE VISUALIZACIÓN DEL VALOR ACTUAL
        this.valorActualTextElement.innerText = this.obtenerNumero(this.valorActual) || '0';
    }
}

/*
 * SECCIÓN DE INICIALIZACIÓN Y CONFIGURACIÓN DEL DOM
 */
const numeroButtons = document.querySelectorAll('[data-numero]');
const operacionButtons = document.querySelectorAll('[data-operacion]');
const igualButton = document.querySelector('[data-igual]');
const porcentajeButton = document.querySelector('[data-porcentaje]');
const borrarButton = document.querySelector('[data-borrar]');
const borrarTodoButton = document.querySelector('[data-borrar-todo]');
const cambioSignoButton = document.querySelector('[data-cambio-signo]');
const valorPrevioTextElement = document.querySelector('[data-valor-previo]');
const valorActualTextElement = document.querySelector('[data-valor-actual]');

const calculator = new Calculadora(valorPrevioTextElement, valorActualTextElement);

/*
 * CONFIGURACIÓN DE EVENT LISTENERS
 */
numeroButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.agregarNumero(button.innerText);
        calculator.actualizarPantalla();
    });
});

operacionButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.elegirOperacion(button.innerText);
        calculator.actualizarPantalla();
    });
});

igualButton.addEventListener('click', () => {
    calculator.calcular();
    calculator.actualizarPantalla();
});

borrarTodoButton.addEventListener('click', () => {
    calculator.borrarTodo();
    calculator.actualizarPantalla();
});

borrarButton.addEventListener('click', () => {
    calculator.borrar();
    calculator.actualizarPantalla();
});

porcentajeButton.addEventListener('click', () => {
    calculator.calcularPorcentaje();
    calculator.actualizarPantalla();
});

cambioSignoButton.addEventListener('click', () => {
    calculator.cambiarSigno();
    calculator.actualizarPantalla();
});

// SOPORTE PARA TECLADO
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        calculator.agregarNumero(e.key);
        calculator.actualizarPantalla();
    } else if (e.key === '.') {
        calculator.agregarNumero('.');
        calculator.actualizarPantalla();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const operacion = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key === '-' ? '−' : e.key;
        calculator.elegirOperacion(operacion);
        calculator.actualizarPantalla();
    } else if (e.key === 'Enter' || e.key === '=') {
        calculator.calcular();
        calculator.actualizarPantalla();
    } else if (e.key === 'Escape') {
        calculator.borrarTodo();
        calculator.actualizarPantalla();
    } else if (e.key === 'Backspace') {
        calculator.borrar();
        calculator.actualizarPantalla();
    } else if (e.key === '%') {
        calculator.calcularPorcentaje();
        calculator.actualizarPantalla();
    }
});

/*Laboratorio:
1. Arreglar bug que limite los numeros en pantalla
2. Funcionabilidad de boton de porcentaje
3. Si lo que se presiona despues de igual es un numero entonces que borre el resultado anterior e inicie una nueva operacion
4. Muestre la operacion completa en el display superior
*/