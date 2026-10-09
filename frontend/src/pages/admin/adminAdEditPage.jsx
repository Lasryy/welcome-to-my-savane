import { useParams } from "react-router-dom";
import AdForm from "./adminAdForm";

export default function AdminAdEditPage() {
  const { id } = useParams();
  return <AdForm key={id} adId={id} />;
}
