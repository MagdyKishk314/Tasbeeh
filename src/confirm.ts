import { Alert, Platform } from 'react-native';

/** Destructive-action confirmation. Alert.alert is a no-op on web, so fall back to the browser dialog there. */
export function confirmDestructive(title: string, message: string, actionLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: actionLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
