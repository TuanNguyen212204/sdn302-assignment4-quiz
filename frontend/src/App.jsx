import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { restoreUser } from "./store/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuizListPage from "./pages/QuizListPage";
import TakeQuizPage from "./pages/TakeQuizPage";
import ManageQuestionsPage from "./pages/ManageQuestionsPage";
import ManageQuizzesPage from "./pages/ManageQuizzesPage";

function HomePage() {
  // The reference dashboard home is intentionally empty beneath navigation.
  return null;
}

export default function App() {
  const dispatch = useDispatch();
  const checkingSession = useSelector(function (state) {
    return state.auth.checkingSession;
  });

  useEffect(
    function () {
      if (checkingSession) {
        dispatch(restoreUser());
      }
    },
    [dispatch, checkingSession],
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="quiz" element={<QuizListPage />} />
          <Route path="quiz/:quizId" element={<TakeQuizPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="questions" element={<ManageQuestionsPage />} />
          <Route path="quizzes" element={<ManageQuizzesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
