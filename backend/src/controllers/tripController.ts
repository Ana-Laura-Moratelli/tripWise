import { Request, RequestHandler, Response } from "express";
import { db } from "../services/firebase";

export const registrarViagem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, voos, hoteis } = req.body;

    if (!userId || !Array.isArray(voos) || !Array.isArray(hoteis)) {
      res.status(400).json({ error: "Dados inválidos. Certifique-se de enviar userId, voos e hoteis." });
      return;
    }

    await db.collection("trip").add({
      userId,
      voos,
      hoteis,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Viagem registrada com sucesso" });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errMessage });
  }
};

export const listarViagens = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'Parâmetro userId é obrigatório.' });
      return;
    }

    const snapshot = await db
      .collection("trip")
      .where("userId", "==", userId)
      .get();

    const viagens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(viagens);
  } catch (error: any) {
    console.error("Erro ao listar viagens:", error.message);
    res.status(500).json({ error: error.message || "Erro ao listar viagens." });
  }
};

export const deletarViagem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("trip").doc(id).delete();
    res.status(200).json({ message: "Viagem cancelada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar viagem." });
  }
};

export const adicionarItinerario: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeLocal, tipo, valor, descricao, dia, endereco } = req.body;

    if (!nomeLocal || !tipo || !dia) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const docRef = db.collection("trip").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: "Viagem não encontrada." });
      return;
    }

    const dados = docSnap.data();
    const itinerariosAtuais = dados?.itinerarios || [];

    const novoItem = {
      nomeLocal,
      tipo,
      valor: valor || '',
      descricao: descricao || '',
      dia,
      endereco: endereco || {}, // <-- aqui tratamos como opcional
      criadoEm: new Date(),
    };

    await docRef.update({
      itinerarios: [...itinerariosAtuais, novoItem],
    });

    res.status(200).json({ message: "Itinerário adicionado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao adicionar itinerário:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};



  export const deletarItinerario: RequestHandler = async (req, res) => {
    try {
      const { id, itemIndex } = req.params;
      const index = Number(itemIndex);
  
      if (isNaN(index)) {
        res.status(400).json({ error: "Índice inválido." });
        return;
      }
  
      const docRef = db.collection("trip").doc(id);
      const docSnap = await docRef.get();
  
      if (!docSnap.exists) {
        res.status(404).json({ error: "Viagem não encontrada." });
        return;
      }
  
      const dados = docSnap.data();
      const itinerariosAtuais = dados?.itinerarios || [];
  
      if (index < 0 || index >= itinerariosAtuais.length) {
        res.status(400).json({ error: "Índice fora dos limites." });
        return;
      }
  
      itinerariosAtuais.splice(index, 1);
      await docRef.update({ itinerarios: itinerariosAtuais });
  
      res.status(200).json({ message: "Itinerário removido com sucesso." });
      return;
    } catch (error: any) {
      console.error("Erro ao remover itinerário:", error);
      res.status(500).json({ error: error.message || "Erro interno ao remover itinerário." });
      return;
    }
  };

  export const atualizarItinerario: RequestHandler = async (req, res) => {
    try {
      const { id, itemIndex } = req.params;
      const index = Number(itemIndex);
      const novoItem = req.body; 
  
      if (isNaN(index)) {
        res.status(400).json({ error: "Índice inválido." });
        return;
      }
  
      const docRef = db.collection("trip").doc(id);
      const docSnap = await docRef.get();
  
      if (!docSnap.exists) {
        res.status(404).json({ error: "Viagem não encontrada." });
        return;
      }
  
      const dados = docSnap.data();
      const itinerariosAtuais = dados?.itinerarios || [];
  
      if (index < 0 || index >= itinerariosAtuais.length) {
        res.status(400).json({ error: "Índice fora dos limites." });
        return;
      }
  
      const { originalIndex, ...dadosParaAtualizar } = novoItem;
  
      itinerariosAtuais[index] = { ...itinerariosAtuais[index], ...dadosParaAtualizar };
  
      await docRef.update({ itinerarios: itinerariosAtuais });
  
      res.status(200).json({ message: "Itinerário atualizado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao atualizar itinerário:", error);
      res.status(500).json({ error: error.message || "Erro interno ao atualizar itinerário." });
    }
  };
  
 
  