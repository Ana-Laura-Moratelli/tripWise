import { RequestHandler } from "express";
import { db } from "../services/firebase";

export const createEmergencyContact: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {name, phone, relation, observacoes } = req.body;

    if ( !name || !phone || !relation ) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const tripRef = db.collection("trip").doc(tripId);
    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      res.status(404).json({ error: "Viagem não encontrada." });
      return;
    }

    await db.collection("emergencyContact").add({
      tripId,
      name,
      phone,
      relation,
      observacoes,
      criadoEm: new Date(),
    });

    res.status(200).json({ message: "Contato de emergência adicionado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao adicionar contato de emergência:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};


export const readEmergencyContact: RequestHandler = async (req, res) => {
    try {
      const { tripId } = req.params;
  
      console.log("Buscando contatos de emergência para tripId:", tripId);
  
      const snapshot = await db
        .collection("emergencyContact")
        .where("tripId", "==", tripId)
        .get();
  
      console.log("Quantidade de contatos encontrados:", snapshot.size);
  
      const emergencyContacts = snapshot.docs.map(emergencyContact => ({
        id: emergencyContact.id,
        ...emergencyContact.data(),
      }));
  
      res.status(200).json(emergencyContacts);
    } catch (error: any) {
      console.error("Erro ao buscar contatos de emergência:", error);
      res.status(500).json({ error: error.message || "Erro interno" });
    }
  };
  


export const updateEmergencyContact: RequestHandler = async (req, res) => {
  try {
    const { emergencyContactId } = req.params;
    const { name, phone, relation, observacoes } = req.body;

    if (!name?.trim() || !phone?.trim() || !relation?.trim()) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const emergencyContactIdRef = db.collection("emergencyContact").doc(emergencyContactId);
    const emergencyContactSnap = await emergencyContactIdRef.get();

    if (!emergencyContactSnap.exists) {
      res.status(404).json({ error: "Documento não encontrado." });
      return;
    }

    await emergencyContactIdRef.update({
      name,
      phone,
      relation,
      observacoes: observacoes || "", 
      atualizadoEm: new Date(),
    });

    res.status(200).json({ message: "Contato de emergência atualizado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao atualizar contato de emergência:", error);
    res.status(500).json({ error: error.message || "Erro interno ao atualizar o contato de emergência." });
  }
};
export const deleteEmergencyContact: RequestHandler = async (req, res) => {
  try {
    const { emergencyContactId } = req.params;

    const emergencyContactIdRef = db.collection("emergencyContact").doc(emergencyContactId);
    const emergencyContactSnap = await emergencyContactIdRef.get();

    if (!emergencyContactSnap.exists) {
      res.status(404).json({ error: "Contato de emergência não encontrado." });
      return;
    }

    await emergencyContactIdRef.delete();

    res.status(200).json({ message: "Contato de emergência excluído com sucesso." });
  } catch (error: any) {
    console.error("Erro ao deletar:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};
