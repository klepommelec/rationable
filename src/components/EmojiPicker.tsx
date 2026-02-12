
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

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

const EmojiPicker: React.FC<EmojiPickerProps> = ({ emoji, setEmoji }) => {
  const { t } = useI18nUI();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const EMOJI_CATEGORIES: EmojiCategory[] = [
    {
      name: t('emoji.tabs.popular'),
      shortName: "⭐",
      emojis: ['🤔', '💻', '✈️', '🏠', '🎉', '💡', '💸', '❤️', '🍔', '📚', '🏆', '🤷', '😊', '👍', '🔥', '⭐', '🚀', '🎯', '💪', '🌟'],
      searchTerms: ['populaire', 'fréquent', 'commun', 'utilisé', 'popular', 'common', 'frequent', 'used']
    },
    {
      name: t('emoji.tabs.emotions'),
      shortName: "😊",
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
      searchTerms: ['émotion', 'sentiment', 'visage', 'sourire', 'content', 'triste', 'colère', 'joie', 'emotion', 'feeling', 'face', 'smile', 'happy', 'sad', 'anger', 'joy']
    },
    {
      name: t('emoji.tabs.activities'),
      shortName: "⚽",
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
      searchTerms: ['sport', 'activité', 'jeu', 'exercice', 'fitness', 'loisir', 'compétition', 'match', 'activity', 'game', 'exercise', 'competition']
    },
    {
      name: t('emoji.tabs.objects'),
      shortName: "💻",
      emojis: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓', '👟', '👠', '🥿', '👞', '👡', '🩴'],
      searchTerms: ['objet', 'outil', 'technologie', 'appareil', 'machine', 'ordinateur', 'téléphone', 'chaussure', 'sneakers', 'baskets', 'avion', 'voiture', 'transport', 'object', 'tool', 'technology', 'device', 'computer', 'phone', 'shoe', 'plane', 'car']
    },
    {
      name: t('emoji.tabs.nature'),
      shortName: "🌱",
      emojis: ['🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️', '🚤', '🛥️', '🚢', '⛵', '🛶', '⚓', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
      searchTerms: ['nature', 'plante', 'animal', 'environnement', 'monde', 'terre', 'météo', 'transport', 'voyage', 'avion', 'voiture', 'plant', 'animal', 'environment', 'world', 'weather', 'travel', 'plane', 'car']
    },
    {
      name: t('emoji.tabs.food'),
      shortName: "🍔",
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧇', '🥞', '🧈', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡'],
      searchTerms: ['nourriture', 'manger', 'repas', 'cuisine', 'restaurant', 'boisson', 'fruit', 'légume', 'food', 'eat', 'meal', 'restaurant', 'drink', 'fruit', 'vegetable']
    },
    {
      name: t('emoji.tabs.symbols'),
      shortName: "❤️",
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🪗', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘', '💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🕋', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '🦿', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🫀', '🫁', '🩸', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️'],
      searchTerms: ['symbole', 'signe', 'coeur', 'amour', 'couleur', 'forme', 'flèche', 'main', 'personne', 'symbol', 'sign', 'heart', 'love', 'color', 'shape', 'arrow', 'hand', 'person']
    }
  ];

  const filteredEmojis = React.useMemo(() => {
    if (!searchTerm) return EMOJI_CATEGORIES;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Créer un mapping des emojis vers leurs termes de recherche
    const emojiSearchMap: Record<string, string[]> = {
      '🤔': ['réfléchir', 'penser', 'hmm', 'question', 'doute', 'think', 'wonder', 'doubt'],
      '💻': ['ordinateur', 'computer', 'travail', 'bureau', 'laptop', 'pc', 'work', 'office'],
      '✈️': ['avion', 'voyage', 'vacances', 'vol', 'transport', 'plane', 'travel', 'flight', 'trip'],
      '🏠': ['maison', 'home', 'habiter', 'domicile', 'logement', 'house', 'housing'],
      '🎉': ['fête', 'célébration', 'party', 'joie', 'succès', 'celebration', 'joy', 'success'],
      '💡': ['idée', 'lumière', 'innovation', 'créativité', 'solution', 'idea', 'light', 'innovation', 'solution'],
      '💸': ['argent', 'money', 'dépense', 'coût', 'prix', 'expense', 'cost', 'price'],
      '❤️': ['amour', 'love', 'coeur', 'romance', 'affection', 'heart', 'like', 'red'],
      '🍔': ['burger', 'nourriture', 'manger', 'fast food', 'restaurant', 'food', 'eat', 'hamburger'],
      '📚': ['livre', 'étudier', 'école', 'lecture', 'apprendre', 'book', 'study', 'school', 'read', 'learn'],
      '🏆': ['trophée', 'gagner', 'victoire', 'champion', 'réussite', 'trophy', 'win', 'victory', 'champion', 'success'],
      '🤷': ['hausser épaules', 'je sais pas', 'peu importe', 'indifférent', 'shrug', 'dunno', 'whatever', 'indifferent'],
      '😊': ['sourire', 'content', 'heureux', 'joie', 'satisfait', 'smile', 'happy', 'joy', 'satisfied'],
      '👍': ['pouce', 'bien', 'ok', 'approuver', 'accord', 'thumb', 'good', 'ok', 'approve', 'yes'],
      '🔥': ['feu', 'chaud', 'excellent', 'populaire', 'tendance', 'fire', 'hot', 'excellent', 'popular', 'trend'],
      '⭐': ['étoile', 'star', 'favori', 'excellent', 'top', 'favorite', 'best'],
      '🚀': ['fusée', 'rapide', 'lancement', 'startup', 'croissance', 'rocket', 'fast', 'launch', 'growth'],
      '🎯': ['cible', 'objectif', 'but', 'précision', 'focus', 'target', 'goal', 'aim', 'precision', 'focus'],
      '💪': ['force', 'muscle', 'pouvoir', 'détermination', 'fort', 'strength', 'muscle', 'power', 'determination', 'strong'],
      '🌟': ['brillant', 'star', 'succès', 'excellent', 'remarquable', 'sparkle', 'success', 'excellent', 'remarkable']
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
  }, [searchTerm, EMOJI_CATEGORIES]);

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-4xl w-14 h-14 rounded-full hover:bg-muted shrink-0 transition-colors" style={{ fontSize: '48px', lineHeight: '48px', verticalAlign: 'middle' }}>
          {emoji}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-background border-border shadow-lg z-50" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={t('emoji.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (!pasted) return;
                e.preventDefault();
                const input = searchInputRef.current;
                const start = input?.selectionStart ?? searchTerm.length;
                const end = input?.selectionEnd ?? searchTerm.length;
                const next = searchTerm.slice(0, start) + pasted + searchTerm.slice(end);
                setSearchTerm(next);
                const pos = start + pasted.length;
                setTimeout(() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    searchInputRef.current.setSelectionRange(pos, pos);
                  }
                }, 0);
              }}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue={t('emoji.tabs.popular')} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-muted/50 rounded-none border-b h-auto p-1 text-xs">
            <TabsTrigger value={t('emoji.tabs.popular')} className="text-xs py-2 px-1">⭐</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.emotions')} className="text-xs py-2 px-1">😊</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.activities')} className="text-xs py-2 px-1">⚽</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.objects')} className="text-xs py-2 px-1">💻</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.nature')} className="text-xs py-2 px-1">🌱</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.food')} className="text-xs py-2 px-1">🍔</TabsTrigger>
            <TabsTrigger value={t('emoji.tabs.symbols')} className="text-xs py-2 px-1">❤️</TabsTrigger>
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

export { EmojiPicker };
