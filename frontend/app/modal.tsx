import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  ActionSheetIOS,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

const travelTips = {
  África: {
    title: 'Dicas para África',
    culture: 'A cultura africana é uma das mais antigas e diversas do mundo, com uma impressionante riqueza de línguas, crenças, tradições e expressões artísticas. Em cada país, você encontrará rituais, músicas tribais, vestimentas coloridas e danças tradicionais que expressam identidade e pertencimento. Visitar feiras, vilarejos e participar de festividades locais é uma maneira autêntica de mergulhar no cotidiano africano.',
    gastronomy: 'A culinária africana é extremamente variada. No Norte, pratos como cuscuz e tajine trazem influência árabe. No Oeste, o uso de amendoim, batata-doce e mandioca é comum. Na Etiópia, o injera é um pão fermentado que acompanha diversos ensopados. Cada país possui uma explosão de sabores únicos, temperos marcantes e formas tradicionais de preparo que tornam a experiência gastronômica inesquecível.',
    precautions: 'Antes de viajar, consulte sobre vacinas obrigatórias (como febre amarela) e cuidados básicos com água e alimentação. Evite alimentos crus em áreas com saneamento precário. Leve repelente contra mosquitos, especialmente em áreas propensas à malária, e fique atento a zonas de instabilidade política ou com restrições de segurança para turistas.',
  },
  Ásia: {
    title: 'Dicas para Ásia',
    culture: 'A Ásia é um continente vasto e fascinante, onde culturas milenares convivem com a tecnologia de ponta. De templos milenares na Tailândia e Japão a grandes centros urbanos como Tóquio e Seul, você será surpreendido por tradições espirituais, cerimoniais únicos e valores baseados em respeito, coletividade e espiritualidade. Não deixe de vivenciar festivais locais como o Diwali (Índia), Hanami (Japão) ou o Ano Novo Lunar (China).',
    gastronomy: 'Prepare-se para uma jornada gastronômica rica em sabores exóticos e contrastantes. Desde os noodles de rua na Tailândia, passando pelos curries indianos até os ramens japoneses, há uma infinidade de experiências para o paladar. Explore também os mercados noturnos, ideais para provar comidas típicas e conhecer ingredientes incomuns.',
    precautions: 'Atenção à água potável – prefira sempre água engarrafada. Em países tropicais, redobre os cuidados com higiene alimentar. O trânsito em algumas cidades pode ser caótico, então evite dirigir. Em locais com grande fluxo de turistas, fique atento a possíveis golpes e negociações maliciosas.',
  },
  Europa: {
    title: 'Dicas para Europa',
    culture: 'A Europa é um verdadeiro museu a céu aberto. Cada país possui identidade cultural marcante, com seus próprios idiomas, expressões artísticas e tradições. Você pode explorar castelos medievais, ruínas romanas, igrejas góticas e museus de renome mundial. Aproveite também para aprender sobre a história de cada lugar, incluindo as influências de guerras, movimentos artísticos e filosóficos.',
    gastronomy: 'A diversidade da culinária europeia é um espetáculo à parte. Na França, experimente queijos e vinhos; na Itália, massas e azeites; na Espanha, tapas e paellas. Os mercados locais são ótimos lugares para experimentar produtos artesanais e pratos típicos. Não deixe de harmonizar os sabores com as bebidas regionais.',
    precautions: 'Embora a Europa seja relativamente segura, fique atento a furtos em regiões muito turísticas, como estações de metrô ou pontos turísticos famosos. Planeje-se bem com relação ao clima, que pode variar drasticamente entre os países e estações. Verifique também exigências de visto e documentação atualizada.',
  },
  'América do Norte': {
    title: 'Dicas para América do Norte',
    culture: 'Os Estados Unidos e o Canadá oferecem uma mescla de culturas de imigrantes com tradições locais. Nos EUA, vivencie a diversidade entre estados como Califórnia, Texas e Nova York. No Canadá, descubra a coexistência das culturas anglófona e francófona, além da forte valorização da natureza e cultura indígena. Shows, musicais e eventos esportivos são experiências típicas para turistas.',
    gastronomy: 'A gastronomia norte-americana vai muito além do fast-food. Explore delícias como bagels e cheesecakes em Nova York, frutos do mar no Canadá e tacos no sul dos EUA. As porções são generosas, e há grande oferta de comida étnica, especialmente em grandes cidades.',
    precautions: 'O sistema de saúde nos EUA é caro, então recomenda-se um bom seguro viagem. Algumas cidades possuem áreas com maior incidência de violência, então informe-se sobre os bairros mais seguros. Também esteja preparado para variações climáticas extremas, como nevascas no norte ou furacões no sul.',
  },
  'América do Sul': {
    title: 'Dicas para América do Sul',
    culture: 'Do tango argentino ao samba brasileiro, a América do Sul pulsa com arte, música e espiritualidade. Cada país tem festas populares marcantes, como o Carnaval no Brasil, a Festa de Inti Raymi no Peru ou o Festival de Viña del Mar no Chile. Além das belezas naturais, a hospitalidade do povo sul-americano torna a viagem ainda mais especial.',
    gastronomy: 'Delicie-se com pratos autênticos como feijoada, empanadas, arepas e ceviche. A culinária é vibrante, rica em temperos, e muda conforme a geografia — do litoral à cordilheira. Experimente frutas típicas da Amazônia e bebidas locais como mate, pisco ou cachaça.',
    precautions: 'Apesar do clima acolhedor, é importante verificar a segurança urbana em grandes centros e tomar cuidados com pertences. Em áreas de floresta ou serra, consulte guias locais e esteja atento a condições climáticas e animais silvestres. Leve protetor solar, repelente e adapte-se ao fuso horário e altitude, onde aplicável.',
  },
  Oceania: {
    title: 'Dicas para Oceania',
    culture: 'A Oceania combina a modernidade de cidades como Sydney e Auckland com a ancestralidade das culturas indígenas. Conheça os povos Maori, na Nova Zelândia, e os aborígenes, na Austrália, que preservam tradições milenares e uma relação simbiótica com a terra. A cultura local valoriza muito o contato com a natureza e a qualidade de vida.',
    gastronomy: 'A culinária da Oceania reflete uma fusão entre tradições britânicas, asiáticas e nativas. Frutos do mar são destaque absoluto, junto com carnes exóticas e vinhos premiados. Aproveite para explorar mercados de produtores e experiências ao ar livre com comidas típicas.',
    precautions: 'Use protetor solar de alto fator, pois a radiação UV na região é muito forte. Respeite os alertas de praias (correntes e águas-vivas) e a vida selvagem em áreas rurais. Certifique-se de estar vacinado contra doenças recomendadas para viajantes e consulte as exigências de entrada com antecedência.',
  },
};

type Continente = keyof typeof travelTips;
const continentes = Object.keys(travelTips) as Continente[];

export default function TravelTipsScreen() {
  const [selectedContinent, setSelectedContinent] = useState<Continente>('Europa');
  const tips = travelTips[selectedContinent];

  function abrirSelecao() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...continentes, 'Cancelar'],
          cancelButtonIndex: continentes.length,
          title: 'Escolha um continente',
        },
        (buttonIndex) => {
          if (buttonIndex < continentes.length) {
            setSelectedContinent(continentes[buttonIndex]);
          }
        }
      );
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.label}>Selecione um continente:</Text>

      {Platform.OS === 'ios' ? (
        <TouchableOpacity style={styles.input} onPress={abrirSelecao}>
          <Text style={{ color: 'black' }}>{selectedContinent}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedContinent}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedContinent(itemValue as Continente)}
          >
            {continentes.map((continent) => (
              <Picker.Item key={continent} label={continent} value={continent} />
            ))}
          </Picker>
        </View>
      )}
      <ScrollView>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipTitle}>{tips.title}</Text>
          <Text style={styles.tipSubtitle}>Cultura:</Text>
          <Text style={styles.tipText}>{tips.culture}</Text>
          <Text style={styles.tipSubtitle}>Gastronomia:</Text>
          <Text style={styles.tipText}>{tips.gastronomy}</Text>
          <Text style={styles.tipSubtitle}>Cuidados Essenciais:</Text>
          <Text style={styles.tipText}>{tips.precautions}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    padding: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    height: 50,
    color: 'black',
  },
  tipsContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
});
