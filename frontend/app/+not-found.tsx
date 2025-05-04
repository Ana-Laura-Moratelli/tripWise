import { Link, Stack } from 'expo-router';
import { Text, View } from '@/components/Themed';
import styles from '@/src/styles/global';
import stylesNotFound from '@/src/styles/+not-found';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '404', headerBackTitle: 'Voltar' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={stylesNotFound.description}>
          A página que você tentou acessar não existe ou foi movida. 
        </Text>
        <Link href="/" style={stylesNotFound.link}>
          <Text style={stylesNotFound.linkText}>Voltar para tela inicial</Text>
        </Link>
      </View>
    </>
  );
}
