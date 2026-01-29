import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FirebaseActionHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const { t } = useTranslation();

  useEffect(() => {
    if (!mode || !oobCode) {
      // Hatalı link
      navigate("/");
      return;
    }

    if (mode === "resetPassword") {
      navigate(`/change-password?oobCode=${oobCode}`);
    } else if (mode === "verifyEmail") {
      navigate(`/verify-email?oobCode=${oobCode}`);
    } else {
      navigate("/");
    }
  }, [mode, oobCode, navigate]);

  return <p>{t('firebase.redirecting')}</p>;
};

export default FirebaseActionHandler; 