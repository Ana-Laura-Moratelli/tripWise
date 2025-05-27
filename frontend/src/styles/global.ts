import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#5B2FD4', // purple
    secondary: '#FFA500', // orange
    third: '#34A853', // green
    fourth: '#E53935', // red
    black: '#000', // black
    darkGray: '#333', // dark gray
    mediumGray: '#888', // medium gray
    gray: '#DDD', // gray
    lightGray: '#F9F9F9', // light gray
    white: '#FFF', // white

};

export const spacing = {
    xsmall: 4,
    small: 8,
    medium: 12,
    large: 16,
};

export const fontSize = {
    small: 12,
    medium: 14,
    large: 16,
};

export const border = {
    medium: 30,
    large: 40,
    width: 1,
};

export default StyleSheet.create({

    bold: {
        fontWeight: 'bold',
    },
    title: {
        fontSize: fontSize.large,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.large,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        padding: spacing.large,
        backgroundColor: colors.white,
    },
    content: {
        paddingTop: spacing.large,
    },
    input: {
        padding: spacing.large,
        borderRadius: border.large,
        borderWidth: border.width,
        borderColor: colors.gray,
        marginBottom: spacing.medium,
        color: colors.black,
    },
    textarea: {
        padding: spacing.large,
        borderRadius: border.medium,
        marginBottom: spacing.medium,
        borderWidth: border.width,
        borderColor: colors.gray,
        color: colors.black,
        height: 80,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.medium,
    },
    pickerContainer: {
        borderWidth: border.width,
        borderColor: colors.gray,
        borderRadius: border.large,
        overflow: 'hidden',
    },
    picker: {
        borderWidth: border.width,
        borderColor: colors.gray,
        borderRadius: spacing.medium,
        color: colors.black,
    },
    label: {
        marginBottom: spacing.medium,
        fontWeight: 'bold',
        fontSize: fontSize.large,
        color: colors.darkGray,
    },
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.medium,
    },
    flexColumn: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: spacing.medium,
    },
    footer: {
        display: "flex",
        flexDirection: "column",
        gap: spacing.medium,
        paddingTop: spacing.medium,
        marginBottom: spacing.medium,
        bottom: 0,
        width: "100%",
        backgroundColor: colors.white,
        alignItems: "center",
        borderTopWidth: border.width,
        borderColor: colors.gray,
    },
    /* Arrumar footer dos botões de cadastro */
    buttonFooter: {
        marginBottom: spacing.large,
        paddingBottom: spacing.large,
    },
    /* Texto de sem itens na lista */
    noitens: {
        color: colors.gray,
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
    /* Texto carregando... */
    loading: {
        color: colors.gray,
    },
    /* Texto botão de remover */
    removeText: {
        color: colors.fourth,
        fontWeight: 'bold',
    },

    /* Botões */
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
        width: "100%",
        padding: spacing.medium,
        borderRadius: border.large,
        alignItems: "center",

        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
        width: "100%",
        padding: spacing.medium,
        borderRadius: border.large,
        alignItems: "center",

        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonThird: {
        backgroundColor: colors.third,
        width: "100%",
        padding: spacing.medium,
        borderRadius: border.large,
        alignItems: "center",

        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonFourth: {
        backgroundColor: colors.fourth,
        width: "100%",
        padding: spacing.medium,
        borderRadius: border.large,
        alignItems: "center",

        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    /* Card padrão */
    card: {
        backgroundColor: colors.lightGray,
        padding: spacing.large,
        borderRadius: border.medium,
        marginBottom: spacing.small,
        display: "flex",
        flexDirection: "column",
        gap: spacing.small,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardEditing: {
        backgroundColor: colors.lightGray,
        padding: spacing.large,
        borderRadius: border.medium,
        marginBottom: spacing.small,
        display: "flex",
        flexDirection: "column",
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    /* Titulo do card */
    cardTitle: {
        fontSize: fontSize.large,
        fontWeight: "bold",
        marginBottom: spacing.xsmall,
    },
    cardLabel: {
        fontSize: fontSize.large,
        fontWeight: "bold",
        marginBottom: spacing.small,
    },
    width70: {
        display: "flex",
        gap: spacing.small,
        width: "70%",
    },
    /* Informações do card */
    cardInfo: {
        fontSize: fontSize.large,
        color: colors.darkGray,
    },
    /* Informações do card cor primária */
    cardInfoPrimary: {
        fontSize: fontSize.large,
        fontWeight: 'bold',
        color: colors.primary,
    },

    /* Card comparador de preços */
    comparatorContainer: {
        marginTop: spacing.large,
        padding: spacing.large,
        backgroundColor: colors.lightGray,
        borderRadius: border.medium,
    },
    comparatorTitle: {
        fontSize: fontSize.large,
        fontWeight: 'bold',
        marginBottom: spacing.medium,
    },
    comparatorItem: {
        fontSize: fontSize.medium,
        marginBottom: spacing.xsmall,
    },

    /* Badge Importado */
      importedBadgeContainer: {
        backgroundColor: colors.secondary,   // cor de destaque
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: border.medium,
        alignSelf: 'flex-start',
 
    },
    importedBadgeText: {
        color: colors.black,
        fontWeight: 'bold',
        fontSize: 12,
    },

    /* Notification */
    typeAlert: {
        fontWeight: 'bold',
        marginBottom: spacing.xsmall,
    },
});

