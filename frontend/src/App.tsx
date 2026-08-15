import { AuthLayout } from "./layouts";
import RegisterForm from "./components/RegisterForm";

export default function App() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}