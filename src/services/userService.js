import { doc, getDoc, onSnapshot, runTransaction, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { ROLES } from "@/lib/constants/roles";
import { normalizeProfile, validateProfile } from "@/utils/profileValidation";

const reference = (uid) => doc(getFirebaseDb(), "users", uid);
const mapProfile = (snapshot) =>
  snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;

export const userService = {
  async getProfile(uid) {
    return mapProfile(await getDoc(reference(uid)));
  },
  observeProfile(uid, onChange, onError) {
    return onSnapshot(reference(uid), (snapshot) => onChange(mapProfile(snapshot)), onError);
  },
  async createProfile(identity, data) {
    if (![ROLES.CUSTOMER, ROLES.ENTREPRENEUR].includes(data.role))
      throw new Error("Selecciona Cliente o Emprendedor.");
    const profile = normalizeProfile(data, identity.email);
    const error = validateProfile(profile, data.role);
    if (error) throw new Error(error);
    const value = {
      ...profile,
      role: data.role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    await runTransaction(getFirebaseDb(), async (transaction) => {
      const ref = reference(identity.uid);
      if ((await transaction.get(ref)).exists()) throw new Error("Esta cuenta ya tiene un perfil.");
      transaction.set(ref, value);
    });
    return { ...value, id: identity.uid };
  },
  async updateProfile(user, data) {
    const profile = normalizeProfile(data, user.email);
    const error = validateProfile(profile, user.role);
    if (error) throw new Error(error);
    // Email and role are not editable through this form.
    const { name, phone, address, deliveryInstructions } = profile;
    await updateDoc(reference(user.id), { name, phone, address, deliveryInstructions });
  },
};
