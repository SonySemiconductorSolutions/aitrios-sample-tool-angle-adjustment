import { Button, Stack, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface NotFoundProps {
    errorMessage?: string;
}

export const NotFound = ({ errorMessage }: NotFoundProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Stack
            gap={1.5}
            alignItems="center"
            justifyContent="center"
            height="calc(100dvh - 120px)"
        >
            <Typography level="h3">
                {errorMessage ? t(errorMessage) : t("invalidPage.pageNotFound")}
            </Typography>
            <Typography textAlign="center">{t("invalidPage.returnToDashboard")}</Typography>
            <Button
                size="lg"
                onClick={() => navigate("/")}
                data-testid="goto-dashboard-btn"
            >
                {t("sidebar.dashboard")}
            </Button>
        </Stack>
    );
};
