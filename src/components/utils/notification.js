import { notification } from 'antd';

export function displayNotification(message, type, { hideAfter=5, showCloseButton=false, id, singleton=true, actions } = {}) {
    return notification[type]({
        message: type.substring(0, 1).toUpperCase() + type.substring(1),
        description: message,
        key: id,
        duration: hideAfter,
        placement: 'bottomRight',
        bottom: 50,
    });
}

export function showError(message, options) {
    if (options) {
        if (typeof options.hideAfter !== 'number') {
            options.hideAfter = 4000;
        }
        if (typeof options.showCloseButton !== 'boolean') {
            options.showCloseButton = true;
        }
    }
    else {
        options = {hideAfter: 4000, showCloseButton: true};
    }
    return displayNotification(message, 'error', options);
}

export function showInfo(message, options) {
    return displayNotification(message, 'info', options);
}

export function showWarning(message, options) {
    return displayNotification(message, 'warning', options);
}

export function showSuccess(message, options) {
    return displayNotification(message, 'success', options);
}
