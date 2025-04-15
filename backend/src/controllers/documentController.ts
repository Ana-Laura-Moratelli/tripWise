
import { Request, RequestHandler, Response } from "express";
import { db } from "../services/firebase";

export const adicionarDocumento: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { tipo, numero, validade, observacoes } = req.body;
  
      if (!tipo || !numero || !validade) {
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
      const documentosAtuais = dados?.documentos || [];
  
      const novoDocumento = {
        tipo,
        numero,
        validade,
        observacoes,
        criadoEm: new Date(),
      };
  
      await docRef.update({
        documentos: [...documentosAtuais, novoDocumento],
      });
  
      res.status(200).json({ message: "Documento adicionado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao adicionar documento:", error);
      res.status(500).json({ error: error.message || "Erro interno" });
    }
  };
  

  export const listarDocumentos: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
  
      const docRef = db.collection("trip").doc(id);
      const docSnap = await docRef.get();
  
      if (!docSnap.exists) {
        res.status(404).json({ error: "Viagem não encontrada." });
        return;
      }
  
      const dados = docSnap.data();
      const documentos = dados?.documentos || [];
  
      res.status(200).json(documentos);
    } catch (error: any) {
      console.error("Erro ao buscar documentos:", error);
      res.status(500).json({ error: error.message || "Erro interno" });
    }
  };