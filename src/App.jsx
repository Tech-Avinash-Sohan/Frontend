import { AuthProvider } from "./context/auth_context";
import { SchoolProvider } from "./context/school_context";
import AppRoutes from "./app/routes";

// Every screen calls the Django API through src/services/* -> src/lib/api_client.js.

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <AppRoutes />
      </SchoolProvider>
    </AuthProvider>
  );
}
