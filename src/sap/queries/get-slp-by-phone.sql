SELECT
    T0."SlpCode",
    T0."SlpName",
    T0."U_login",
    T0."U_password",
    T0."U_role",
    T0."U_summa",
    T0."U_workDay",
    T0."U_branch",
    T0."U_onlinepbx",
    T0."Mobil"
FROM "{{schema}}"."OSLP" T0
WHERE RIGHT(REPLACE(REPLACE(T0."Mobil", '+', ''), ' ', ''), 9) = ?