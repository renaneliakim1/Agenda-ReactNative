import { Alert, Platform } from 'react-native';

/**
 * Exibe um alerta compatível com web e mobile
 * @param titulo - Título do alerta
 * @param mensagem - Mensagem do alerta
 */
export const mostrarAlerta = (titulo: string, mensagem: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem, [{ text: 'OK' }]);
  }
};

/**
 * Exibe um alerta de confirmação com opções Sim/Não
 * @param titulo - Título do alerta
 * @param mensagem - Mensagem do alerta
 * @param onConfirm - Callback executado quando confirma
 * @param onCancel - Callback executado quando cancela (opcional)
 * @param textoBotaoConfirmar - Texto do botão de confirmação (padrão: "Confirmar")
 * @param textoBotaoCancelar - Texto do botão de cancelar (padrão: "Cancelar")
 */
export const mostrarAlertaConfirmacao = (
  titulo: string,
  mensagem: string,
  onConfirm: () => void,
  onCancel?: () => void,
  textoBotaoConfirmar: string = 'Confirmar',
  textoBotaoCancelar: string = 'Cancelar'
) => {
  if (Platform.OS === 'web') {
    const confirmacao = window.confirm(`${titulo}\n\n${mensagem}`);
    if (confirmacao) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(
      titulo,
      mensagem,
      [
        {
          text: textoBotaoCancelar,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: textoBotaoConfirmar,
          onPress: onConfirm,
        },
      ]
    );
  }
};

/**
 * Exibe um alerta de sucesso
 * @param mensagem - Mensagem de sucesso
 */
export const mostrarSucesso = (mensagem: string) => {
  mostrarAlerta('Sucesso', mensagem);
};

/**
 * Exibe um alerta de erro
 * @param mensagem - Mensagem de erro
 */
export const mostrarErro = (mensagem: string) => {
  mostrarAlerta('Erro', mensagem);
};
