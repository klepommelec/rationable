
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface EmojiPickerProps {
  emoji: string;
  setEmoji: (emoji: string) => void;
}

interface EmojiCategory {
  name: string;
  shortName: string;
  emojis: string[];
  searchTerms: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Populaires",
    shortName: "Pop",
    emojis: ['🤔', '💻', '✈️', '🏠', '🎉', '💡', '💸', '❤️', '🍔', '📚', '🏆', '🤷', '😊', '👍', '🔥', '⭐', '🚀', '🎯', '💪', '🌟'],
    searchTerms: ['populaire', 'fréquent', 'commun', 'utilisé']
  },
  {
    name: "Émotions", 
    shortName: "😊",
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    searchTerms: ['émotion', 'sentiment', 'visage', 'sourire', 'content', 'triste', 'colère', 'joie']
  },
  {
    name: "Activités",
    shortName: "⚽",
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
    searchTerms: ['sport', 'activité', 'jeu', 'exercice', 'fitness', 'loisir', 'compétition', 'match']
  },
  {
    name: "Objets",
    shortName: "💻",
    emojis: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓', '👟', '👠', '🥿', '👞', '👡', '🩴'],
    searchTerms: ['objet', 'outil', 'technologie', 'appareil', 'machine', 'ordinateur', 'téléphone', 'chaussure', 'sneakers', 'baskets', 'avion', 'voiture', 'transport']
  },
  {
    name: "Nature",
    shortName: "🌱",
    emojis: ['🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️', '🚤', '🛥️', '🚢', '⛵', '🛶', '⚓', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
    searchTerms: ['nature', 'plante', 'animal', 'environnement', 'monde', 'terre', 'météo', 'transport', 'voyage', 'avion', 'voiture']
  },
  {
    name: "Nourriture",
    shortName: "🍔",
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧇', '🥞', '🧈', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡'],
    searchTerms: ['nourriture', 'manger', 'repas', 'cuisine', 'restaurant', 'boisson', 'fruit', 'légume']
  },
  {
    name: "Symboles",
    shortName: "❤️",
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🪗', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘', '💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🕋', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '🦿', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🫀', '🫁', '🩸', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️'],
    searchTerms: ['symbole', 'signe', 'coeur', 'amour', 'couleur', 'forme', 'flèche', 'main', 'personne']
  }
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ emoji, setEmoji }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredEmojis = React.useMemo(() => {
    if (!searchTerm) return EMOJI_CATEGORIES;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Créer un mapping des emojis vers leurs termes de recherche
    const emojiSearchMap: Record<string, string[]> = {
      '🤔': ['réfléchir', 'penser', 'hmm', 'question', 'doute'],
      '💻': ['ordinateur', 'computer', 'travail', 'bureau', 'laptop', 'pc'],
      '✈️': ['avion', 'voyage', 'vacances', 'vol', 'transport'],
      '🏠': ['maison', 'home', 'habiter', 'domicile', 'logement'],
      '🎉': ['fête', 'célébration', 'party', 'joie', 'succès'],
      '💡': ['idée', 'lumière', 'innovation', 'créativité', 'solution'],
      '💸': ['argent', 'money', 'dépense', 'coût', 'prix'],
      '❤️': ['amour', 'love', 'coeur', 'romance', 'affection'],
      '🍔': ['burger', 'nourriture', 'manger', 'fast food', 'restaurant'],
      '📚': ['livre', 'étudier', 'école', 'lecture', 'apprendre'],
      '🏆': ['trophée', 'gagner', 'victoire', 'champion', 'réussite'],
      '🤷': ['hausser épaules', 'je sais pas', 'peu importe', 'indifférent'],
      '😊': ['sourire', 'content', 'heureux', 'joie', 'satisfait'],
      '👍': ['pouce', 'bien', 'ok', 'approuver', 'accord'],
      '🔥': ['feu', 'chaud', 'excellent', 'populaire', 'tendance'],
      '⭐': ['étoile', 'star', 'favori', 'excellent', 'top'],
      '🚀': ['fusée', 'rapide', 'lancement', 'startup', 'croissance'],
      '🎯': ['cible', 'objectif', 'but', 'précision', 'focus'],
      '💪': ['force', 'muscle', 'pouvoir', 'détermination', 'fort'],
      '🌟': ['brillant', 'star', 'succès', 'excellent', 'remarquable']
    };
    
    return EMOJI_CATEGORIES.map(category => ({
      ...category,
      emojis: category.emojis.filter(emoji => {
        // Recherche dans les termes de recherche de la catégorie
        const matchesCategoryTerms = category.searchTerms.some(term => 
          term.toLowerCase().includes(lowerSearchTerm)
        );
        
        // Recherche dans le nom de la catégorie
        const matchesCategoryName = category.name.toLowerCase().includes(lowerSearchTerm);
        
        // Recherche dans les termes spécifiques à l'emoji
        const emojiTerms = emojiSearchMap[emoji] || [];
        const matchesEmojiTerms = emojiTerms.some(term => 
          term.toLowerCase().includes(lowerSearchTerm)
        );
        
        return matchesCategoryTerms || matchesCategoryName || matchesEmojiTerms;
      })
    })).filter(category => category.emojis.length > 0);
  }, [searchTerm]);

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-4xl w-14 h-14 rounded-full hover:bg-white/10 shrink-0">
          {emoji}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-background border-border shadow-lg z-50" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un emoji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="Populaires" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-muted/50 rounded-none border-b h-auto p-1 text-xs">
            <TabsTrigger value="Populaires" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[0].shortName}</TabsTrigger>
            <TabsTrigger value="Émotions" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[1].shortName}</TabsTrigger>
            <TabsTrigger value="Activités" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[2].shortName}</TabsTrigger>
            <TabsTrigger value="Objets" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[3].shortName}</TabsTrigger>
            <TabsTrigger value="Nature" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[4].shortName}</TabsTrigger>
            <TabsTrigger value="Nourriture" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[5].shortName}</TabsTrigger>
            <TabsTrigger value="Symboles" className="text-xs py-2 px-1">{EMOJI_CATEGORIES[6].shortName}</TabsTrigger>
          </TabsList>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredEmojis.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-0">
                <div className="p-3">
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((e, index) => (
                      <Button
                        key={`${e}-${index}`}
                        variant="ghost"
                        size="icon"
                        className="text-2xl h-10 w-10 rounded-md hover:bg-accent transition-colors"
                        onClick={() => handleEmojiSelect(e)}
                        title={e}
                      >
                        {e}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
