import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, Switch } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import MaskInput, { Masks } from 'react-native-mask-input';
import { parseISO, isBefore } from 'date-fns';
import { api } from '../../src/services/api';
import { Voo } from '../../src/types/flight';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

const EXCHANGE_RATE_URL = "https://api.exchangerate.host/latest?base=USD&symbols=BRL";

export default function FlightSearch() {
  const [iataOrigem, setIataOrigem] = useState('');
  const [iataDestino, setIataDestino] = useState('');
  const [dataPartida, setDataPartida] = useState('');
  const [dataVolta, setDataVolta] = useState('');
  const [idaEVolta, setIdaEVolta] = useState(true);
  const [voos, setVoos] = useState<Voo[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function formatarParaISO(data: string) {
    const partes = data.split('/');
    if (partes.length === 3) {
      const [diaStr, mesStr, anoStr] = partes;
      const dia = parseInt(diaStr, 10);
      const mes = parseInt(mesStr, 10);
      const ano = parseInt(anoStr, 10);

      if (isNaN(mes) || mes < 1 || mes > 12) {
        throw new Error("Mês inválido. Use valores de 01 a 12.");
      }

      const maxDiasPorMes = [31, (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (isNaN(dia) || dia < 1 || dia > maxDiasPorMes[mes - 1]) {
        throw new Error("Dia inválido para o mês informado.");
      }

      const mm = mesStr.padStart(2, '0');
      const dd = diaStr.padStart(2, '0');
      return `${anoStr}-${mm}-${dd}`;
    }
    return data;
  }

  function validarParametros() {
    const isoPartida = formatarParaISO(dataPartida);
    const isoVolta = formatarParaISO(dataVolta);

    if (!iataOrigem || iataOrigem.length !== 3) {
      throw new Error("O código IATA de origem deve ter 3 letras.");
    }
    if (!iataDestino || iataDestino.length !== 3) {
      throw new Error("O código IATA de destino deve ter 3 letras.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoPartida)) {
      throw new Error("A data de ida deve estar no formato correto.");
    }
    if (idaEVolta && !/^\d{4}-\d{2}-\d{2}$/.test(isoVolta)) {
      throw new Error("A data de volta deve estar no formatocorreto.");
    }
  }

  function calcularChegada(partidaStr: string, duracao: number) {
    if (!partidaStr || !duracao) return 'Não disponível';
    const partida = new Date(partidaStr);
    partida.setMinutes(partida.getMinutes() + duracao);
    return partida.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatarDataCompleta(dataISO: string) {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  async function buscarCotacaoUSD() {
    try {
      const res = await axios.get(EXCHANGE_RATE_URL);
      return res.data?.rates?.BRL ?? 5.71;
    } catch {
      Alert.alert("Aviso", "Erro ao obter taxa de câmbio. Usando valor padrão de R$5,71.");
      return 5.71;
    }
  }

  async function buscarVoos() {
    setLoading(true);
    try {
      validarParametros();
      const now = new Date();
      const hojeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const isoPartida = formatarParaISO(dataPartida);
      const isoVolta = formatarParaISO(dataVolta);

      const dataPartidaISO = parseISO(isoPartida);
      const dataVoltaISO = parseISO(isoVolta);

      if (isBefore(dataPartidaISO, hojeStart)) {
        throw new Error("A data de ida não pode ser anterior ao dia de hoje.");
      }

      if (idaEVolta) {
        if (isBefore(dataVoltaISO, hojeStart)) {
          throw new Error("A data de volta não pode ser anterior ao dia de hoje.");
        }
        if (isBefore(dataVoltaISO, dataPartidaISO)) {
          throw new Error("A data de volta não pode ser anterior à data de ida.");
        }
      }

      const cotacaoBRL = await buscarCotacaoUSD();
      const formatarReal = (valor: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor);

      const response = await api.get('/api/flights', {
        params: {
          iataOrigem: iataOrigem.toUpperCase(),
          iataDestino: iataDestino.toUpperCase(),
          dataPartida: isoPartida,
          dataVolta: isoVolta,
          idaEVolta: idaEVolta,
        },
      });

      const resultados = response.data.best_flights;

      if (!resultados || resultados.length === 0) {
        Alert.alert("Nenhum voo encontrado.");
        setVoos([]);
        return;
      }

      const voosFormatados: Voo[] = [];

      resultados.forEach((voo: any) => {
        const conexoes = voo.flights;
        const metade = idaEVolta ? Math.floor(conexoes.length / 2) : conexoes.length;

        const vooIda = conexoes.slice(0, metade);
        const primeiraIda = vooIda[0];

        const duracaoIda = voo.total_duration / (idaEVolta ? 2 : 1);

        const precoUSD = parseFloat(voo?.price);
        const precoBRL = isNaN(precoUSD) ? null : precoUSD * cotacaoBRL;

        if (primeiraIda?.airline) {
          voosFormatados.push({
            tipo: 'Ida',
            origin: iataOrigem.toUpperCase(),
            destination: iataDestino.toUpperCase(),
            airline: primeiraIda.airline,
            departureTime: formatarDataCompleta(primeiraIda?.departure_airport?.time),
            arrivalTime: calcularChegada(primeiraIda?.departure_airport?.time, duracaoIda),
            price: precoBRL ? formatarReal(precoBRL) : 'Preço não disponível',
          });

          if (idaEVolta) {
            const vooVolta = conexoes.slice(metade);
            const primeiraVolta = vooVolta[0];

            if (primeiraVolta?.airline) {
              const horaVolta = primeiraVolta?.departure_airport?.time?.split('T')[1]?.substring(0, 5) || '12:00';
              const dataHoraPartidaVolta = new Date(`${isoVolta}T${horaVolta}:00`);

              voosFormatados.push({
                tipo: 'Volta',
                origin: iataDestino.toUpperCase(),
                destination: iataOrigem.toUpperCase(),
                airline: primeiraVolta.airline,
                departureTime: dataHoraPartidaVolta.toLocaleString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
                arrivalTime: calcularChegada(dataHoraPartidaVolta.toISOString(), duracaoIda),
                price: precoBRL ? formatarReal(precoBRL) : 'Preço não disponível',
              });
            }
          }
        }
      });

      setVoos(voosFormatados);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao buscar voos.");
    } finally {
      setLoading(false);
    }
  }

  function obterComparativoPrecos(voos: Voo[]): { [companhia: string]: string } {
    const mapaCompanhias: { [companhia: string]: number } = {};
    voos.forEach((voo) => {
      const precoNumerico = parseFloat(
        voo.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
      );
      if (!mapaCompanhias[voo.airline] || precoNumerico < mapaCompanhias[voo.airline]) {
        mapaCompanhias[voo.airline] = precoNumerico;
      }
    });

    const mapaFormatado: { [companhia: string]: string } = {};
    Object.entries(mapaCompanhias).forEach(([companhia, valor]) => {
      mapaFormatado[companhia] = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    });

    return mapaFormatado;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Código IATA Origem (Ex: GRU)"
        value={iataOrigem}
        onChangeText={setIataOrigem}
        autoCapitalize="characters"
        placeholderTextColor={colors.mediumGray}

      />

      <TextInput
        style={styles.input}
        placeholder="Código IATA Destino (Ex: AUA)"
        value={iataDestino}
        onChangeText={setIataDestino}
        autoCapitalize="characters"
        placeholderTextColor={colors.mediumGray}

      />

      <MaskInput
        style={styles.input}
        placeholder="Data de Ida"
        value={dataPartida}
        onChangeText={setDataPartida}
        placeholderTextColor={colors.mediumGray}
        mask={Masks.DATE_DDMMYYYY}
      />

      <View style={styles.switchContainer}>
        <Text>Ida e Volta?</Text>
        <Switch value={idaEVolta} onValueChange={setIdaEVolta} />
      </View>

      {idaEVolta && (
        <MaskInput
          mask={Masks.DATE_DDMMYYYY}
          style={styles.input}
          placeholder="Data de Volta"
          value={dataVolta}
          onChangeText={setDataVolta}
          placeholderTextColor={colors.mediumGray}

        />
      )}

      <TouchableOpacity style={styles.buttonPrimary} onPress={buscarVoos}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      <View style={styles.content}></View>
      {loading ? (
        <ActivityIndicator size="large" color="#5B2FD4" />
      ) : (
        <>

          <FlatList
            data={voos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/modal/flight/infoFlight",
                    params: {
                      tipo: item.tipo,
                      origin: item.origin,
                      destination: item.destination,
                      airline: item.airline,
                      departureTime: item.departureTime,
                      arrivalTime: item.arrivalTime,
                      price: item.price,
                    },
                  })
                }
              >
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.tipo} - {item.origin} → {item.destination}</Text>
                  <Text style={styles.cardInfo}>Companhia: {item.airline}</Text>
                  <Text style={styles.cardInfo}>Partida: {item.departureTime}</Text>
                  <Text style={styles.cardInfo}>Chegada: {item.arrivalTime}</Text>
                  <Text style={styles.cardInfoPrimary}>Preço: {item.price}</Text>
                </View>
              </TouchableOpacity>


            )}
          />

          {voos.length > 0 && (
            <View style={styles.comparatorContainer}>
              <Text style={styles.comparatorTitle}>Comparativo de Preços</Text>
              {Object.entries(obterComparativoPrecos(voos)).map(([companhia, preco]) => (
                <Text key={companhia} style={styles.comparatorItem}>
                  {companhia}: {preco}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}