import { failure, success } from "./serviceResponse.js";

async function loadFirestoreDependencies() {
  const firestore = await import("firebase/firestore");
  const { getFirebaseDb } = await import("../lib/firebase/client.js");
  return { ...firestore, db: getFirebaseDb() };
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function createCatalogService({ loadDependencies = loadFirestoreDependencies } = {}) {
  return {
    async getBusinesses() {
      try {
        const { db, collection, getDocs, query, where } = await loadDependencies();
        const snapshot = await getDocs(query(collection(db, "businesses"), where("active", "==", true)));
        return success(mapSnapshot(snapshot));
      } catch (error) {
        return failure("BUSINESS_READ_ERROR", error?.message || "No se pudieron cargar los negocios.");
      }
    },

    async getBusinessById(businessId) {
      try {
        const { db, doc, getDoc } = await loadDependencies();
        const snapshot = await getDoc(doc(db, "businesses", businessId));
        return success(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      } catch (error) {
        return failure("BUSINESS_READ_ERROR", error?.message || "No se pudo cargar el negocio.");
      }
    },

    async getCatalogByBusinessId(businessId) {
      try {
        const { db, collection, doc, getDoc, getDocs, query, where } = await loadDependencies();
        const [businessSnapshot, categorySnapshot, productSnapshot] = await Promise.all([
          getDoc(doc(db, "businesses", businessId)),
          getDocs(query(collection(db, "categories"), where("businessId", "==", businessId))),
          getDocs(query(collection(db, "products"), where("businessId", "==", businessId))),
        ]);
        if (!businessSnapshot.exists() || businessSnapshot.data().active !== true) {
          return failure("BUSINESS_NOT_FOUND", "El negocio no está disponible.");
        }
        return success({
          business: { id: businessSnapshot.id, ...businessSnapshot.data() },
          categories: [
            { id: "cat_all", businessId, name: "Todos", active: true },
            ...mapSnapshot(categorySnapshot).filter((item) => item.active === true),
          ],
          products: mapSnapshot(productSnapshot).filter((item) => item.active === true),
        });
      } catch (error) {
        return failure("CATALOG_READ_ERROR", error?.message || "No se pudo cargar el catálogo.");
      }
    },
  };
}

export const catalogService = createCatalogService();
