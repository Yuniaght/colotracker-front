import * as zod from 'zod'

export const maxSize = 1024 * 1024 * 0.5 // 512KB
export const minFiles = 1
export const maxFiles = 1
export const allowedTypes: zod.core.util.MimeTypes[] = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg',]
export const subjectEnum = zod.enum(["message", "copyright"])
export const emptyAsNull = (val: unknown) => (val === '' ? null : val);

const registerPartial = zod.object({
  user_name: zod.string("Vous devez remplir mettre un nom utilisateur").min(4, "Votre nom utilisateur doit comprendre au moins 4 caractères").max(100, "Votre nom d'utilisateur ne doit pas dépasser 100 caractères"),
  password: zod.string("Vous devez rentrer un mot de passe").min(8, "Trop court").max(100, "Trop long").regex(/[a-z]/, "Doit contenir une minuscule").regex(/[A-Z]/, "Doit contenir une majuscule").regex(/[!@#$%^&*]/, "Doit contenir un caractère spécial"),
  email: zod.email("Entrez un email valide").trim(),
  privacy: zod.coerce.boolean().refine(value => {
        return value;
    }, {message: "Vous devez accepter les CGUs"}),
})

const askABookPartial = zod.object({
  book_name: zod.string("Le nom du livre est requis").min(1, "Le nom du livre est requis").max(100, "Le nom du livre ne peut dépasser 100 caractères"),
  author: zod.string("Le nom complet de l'auteur/éditeur est requis").min(1, "Le nom complet de l'auteur/éditeur est requis").max(100, "Le nom complet de l'auteur/éditeur ne peut dépasser 100 caractères"),
  page_count: zod.number().int("Le nombre doit être un entier").positive("Le nombre doit être positif"),
  release_date: zod.coerce.date("Entrez une date au format valide : yyyy-mm-dd"),
  store_link: zod.url("Entrez une url valide"),
  privacy: zod.coerce.boolean().refine(value => {
    return value;
  }, {message: "Vous devez accepter les CGUs"}),
})

const commonContactPartial = zod.object({
  lastName: zod.string("Vous devez remplir votre nom").min(1,"Vous devez remplir votre nom").max(100, "Votre nom ne peut excéder 100 caractères"), 
  firstName: zod.string("Vous devez remplir votre prénom").min(1, "Vous devez remplir votre prénom").max(100, "Votre prénom ne peux excéder 100 caractères"),
  email: zod.email("Entrez un email valide"),
  subject: zod.string("Vous devez entrer un sujet").min(1, "Vous devez entrer un sujet").max(300, "Votre sujet ne peux excéder 300 caractères"),
  message: zod.string("Veuillez décrire votre demande").min(1, "Veuillez décrire votre demande"),
  privacy: zod.coerce.boolean().refine(value => {
    return value;
  }, {message: "Vous devez accepter les CGUs"}),
})

const problemUrlContactPartial = zod.object({
  ...commonContactPartial.shape,
  problematicUrl: zod.url("Veuillez entrer une url").startsWith("https://www.colotracker.com/", "Le domaine doit forcement être appartenir à colotracker" )
})

const pagePartial = (max_page: number) => zod.object({
  page_number: zod.number().int("Le chiffre doit être un entier").positive("Le N° de page doit être possitif").refine((val) => val <= Number(max_page), { message: `Le numéro de page ne peut pas dépasser ${max_page}` }),
  date_finished: zod.coerce.date("Veuillez entrer une date valide").max(new Date, "La date ne peut pas être dans le futur"),
  detailed_info: zod.string().min(1, "Vous devez décrire votre oeuvre"),
})

const editProfilePartial = zod.object({
  discord_pseudonym: zod.preprocess(emptyAsNull, zod.string().min(1).nullable()),
  instagram_link: zod.preprocess(emptyAsNull, zod.url().nullable()),
  password: zod.preprocess(emptyAsNull,zod.string().min(8, "Trop court").max(100, "Trop long").regex(/[a-z]/, "Doit contenir une minuscule").regex(/[A-Z]/, "Doit contenir une majuscule").regex(/[!@#$%^&*]/, "Doit contenir un caractère spécial").nullable()),
  confirm_password: zod.preprocess(emptyAsNull,zod.string().nullable()),
  delete_avatar: zod.preprocess((val) => val === 'true' || val === true, zod.boolean().optional().default(false))
})

const reportPagePartial = zod.object({
  reason: zod.string("Vous devez entrer un justificatif de signalement").min(1, "Vous devez entrer un justificatif de signalement")
})

export const zodShared = {
  registerPartial,
  askABookPartial,
  commonContactPartial,
  problemUrlContactPartial,
  pagePartial,
  editProfilePartial,
  reportPagePartial,
}
