import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BookOpen, Mic, Play, Pause, ChevronLeft, ChevronRight, Home, Sparkles, Loader2, Image as ImageIcon, Gamepad2, Puzzle, Trophy, Calculator, HelpCircle, Star, Shuffle, Settings, Music, Palette, Gauge, Check, Volume2, Shapes, Cat, Rocket, Wand2, Smile, CloudSun, Maximize, Minimize, Frown, Rat, FlaskConical, Timer, X, Pencil, Eraser, Download, RefreshCw, Grid, Type as TypeIcon, Link as LinkIcon } from "lucide-react";

// --- Configuration & Constants ---
const GOOGLE_FONT = "Fredoka";

// Music Tracks
const MUSIC_TRACKS = [
  { name: "Cổ điển (Mozart)", url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Wolfgang_Amadeus_Mozart_-_Eine_kleine_Nachtmusik_-_1._Allegro.ogg" },
  { name: "Thiên nhiên", url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Forest-sounds.ogg" }, 
  { name: "Vui nhộn", url: "https://upload.wikimedia.org/wikipedia/commons/4/46/3_Kitten_rag_-_Scott_Joplin.ogg" } 
];

// Background Themes
const BACKGROUND_THEMES = [
  { id: 'default', name: 'Mặc định', class: 'bg-slate-50', text: 'text-gray-800' },
  { id: 'warm', name: 'Giấy ấm', class: 'bg-amber-50', text: 'text-amber-900' },
  { id: 'cool', name: 'Mát mẻ', class: 'bg-azure-50', text: 'text-slate-800' }, 
  { id: 'night', name: 'Ban đêm', class: 'bg-slate-900', text: 'text-slate-100' },
];

// Creating View Themes
const STORY_THEMES = [
  { 
    id: 'animals', 
    label: 'Động Vật', 
    icon: <Cat className="w-6 h-6" />, 
    color: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200',
    prompts: ["Chú chó thám tử tài ba", "Mèo con đi lạc trong siêu thị", "Khủng long tập bay", "Đại hội thể thao rừng xanh", "Gia đình Cánh Cam đi du lịch"] 
  },
  { 
    id: 'space', 
    label: 'Vũ Trụ', 
    icon: <Rocket className="w-6 h-6" />, 
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200',
    prompts: ["Phi hành gia nhí khám phá Sao Hỏa", "Người ngoài hành tinh thân thiện", "Mặt Trăng đi tìm bạn", "Ngôi sao chổi bị lạc đường", "Trường học giữa các vì sao"] 
  },
  { 
    id: 'magic', 
    label: 'Phép Thuật', 
    icon: <Wand2 className="w-6 h-6" />, 
    color: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200',
    prompts: ["Cây đũa thần bị gãy", "Ngôi trường phù thủy nhỏ", "Rồng lửa bị cảm lạnh", "Lọ thuốc tàng hình", "Khu rừng nấm khổng lồ"] 
  },
  { 
    id: 'daily', 
    label: 'Đời Thường', 
    icon: <Smile className="w-6 h-6" />, 
    color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200',
    prompts: ["Ngày đầu tiên đi học", "Giúp mẹ làm bánh sinh nhật", "Chuyến đi thăm sở thú", "Làm quen với bạn hàng xóm mới", "Trồng cây hoa hướng dương"] 
  },
];

// --- Types ---
interface Story {
  title: string;
  pages: string[];
  coverColor?: string;
  icon?: React.ReactNode;
}

interface PageAssets {
  imageUrl?: string;
  audioBuffer?: AudioBuffer;
  isGeneratingImage: boolean;
  isGeneratingAudio: boolean;
}

interface AppSettings {
  bgTheme: string;
  musicVolume: number; // 0 to 1
  musicTrackIndex: number;
  readingSpeed: number; // 0.8, 1, 1.2
}

// --- Pre-defined Stories (Vietnamese) ---
const PREDEFINED_STORIES: Story[] = [
  {
    title: "Chiếc Máy Nướng Bánh Dũng Cảm",
    coverColor: "bg-orange-200",
    pages: [
      "Ngày xửa ngày xưa, có một chiếc máy nướng bánh nhỏ tên là Toastie. Cậu sống trong một căn bếp ấm cúng.",
      "Một ngày nọ, Toastie muốn đi ngắm thế giới. Cậu tự rút phích cắm và nhảy xuống khỏi mặt bàn.",
      "Cậu gặp một chiếc máy hút bụi cáu kỉnh ở hành lang. \"Cậu đi đâu đấy?\" máy hút bụi càu nhàu.",
      "\"Tớ đi phiêu lưu đây!\" Toastie dũng cảm trả lời. Và thế là cậu bước ra khỏi cửa trước.",
      "Toastie nhìn thấy mặt trời, bãi cỏ và bầu trời xanh. Thế giới rộng lớn hơn những lát bánh mì nhiều, và cậu rất thích nó."
    ]
  },
  {
    title: "Bộ Đồ Ngủ Của Ông Trăng",
    coverColor: "bg-indigo-200",
    pages: [
      "Ông Trăng buồn ngủ lắm rồi. Bây giờ là ban ngày, và ông cần chợp mắt một chút.",
      "Ông đi tìm bộ đồ ngủ yêu thích của mình. Bộ đồ màu xanh dương có những ngôi sao vàng.",
      "Ông mặc đồ vào và vỗ vỗ chiếc gối mây. \"Chúc ngủ ngon nhé, thế giới,\" ông thì thầm.",
      "Nhưng ông Mặt Trời ồn ào quá! \"Dậy đi nào!\" Mặt Trời hét lớn. Ông Trăng trùm chăn kín đầu.",
      "Cuối cùng, Mặt Trời cũng lặn, và ông Trăng thức dậy để chiếu sáng cho các bạn nhỏ đang ngủ say."
    ]
  },
  {
    title: "Thỏ Trắng Đi Lạc",
    coverColor: "bg-pink-300",
    pages: [
      "Thỏ Trắng ham chơi đuổi theo một chú bướm sặc sỡ, chạy mãi vào sâu trong rừng mà không hay biết.",
      "Khi trời bắt đầu tối, Thỏ Trắng sợ hãi nhận ra mình không biết đường về nhà. Cây cối xung quanh trông thật to lớn và đáng sợ.",
      "Thỏ ngồi khóc thút thít dưới gốc cây sồi già. Bác Cú Mèo trên cây nghe thấy liền bay xuống hỏi thăm.",
      "Bác Cú Mèo tốt bụng dùng đôi mắt sáng rực dẫn đường cho Thỏ Trắng băng qua rừng rậm để về nhà.",
      "Về đến nhà, Thỏ Mẹ ôm chầm lấy Thỏ Trắng. Thỏ con hứa sẽ không bao giờ mải chơi đi xa nữa."
    ]
  },
  {
    title: "Lâu Đài Kẹo Ngọt",
    coverColor: "bg-fuchsia-200",
    pages: [
      "Trong giấc mơ, bé Misa lạc vào một xứ sở kỳ diệu nơi mọi thứ đều làm bằng bánh kẹo.",
      "Misa thấy một lâu đài to lớn với tường làm bằng bánh quy, mái ngói là sô-cô-la và cửa sổ làm bằng kẹo dẻo trong suốt.",
      "Vua Kẹo Mút mời Misa tham dự bữa tiệc trà với những ly nước ngọt có ga phun ra từ đài phun nước.",
      "Misa vui vẻ nhảy múa cùng các bạn Gấu Kẹo Gummy và Người Tuyết Kem Tươi trên nền nhạc vui nhộn.",
      "Giật mình tỉnh giấc, Misa vẫn thấy dư vị ngọt ngào nơi đầu lưỡi. Đó quả là một giấc mơ tuyệt đẹp."
    ]
  },
  {
    title: "Chuyến Phiêu Lưu Dưới Đáy Biển",
    coverColor: "bg-cyan-400",
    pages: [
       "Cá Nhỏ muốn biết thế giới bên ngoài rạn san hô ra sao, nên cậu quyết định bơi ra biển lớn.",
       "Cậu gặp gỡ bác Cá Voi xanh khổng lồ đang hát những bài ca trầm bổng vang vọng khắp đại dương.",
       "Một đàn Sứa phát sáng lướt qua như những chiếc đèn lồng trôi nổi, chiếu sáng cả một vùng nước tối.",
       "Bất ngờ, một cơn bão biển ập tới! Cá Nhỏ nhanh trí nấp vào vỏ của một bác Trai già tốt bụng.",
       "Khi biển lặng, Cá Nhỏ bơi về nhà và kể cho mọi người nghe về những điều kỳ diệu cậu đã thấy."
    ]
  },
  {
    title: "Cậu Bé Người Gỗ Pinocchio",
    coverColor: "bg-amber-300",
    pages: [
        "Bác thợ mộc Geppetto đẽo một chú bé bằng gỗ và đặt tên là Pinocchio. Bác mong chú trở thành một cậu bé thật sự.",
        "Bà Tiên Xanh hiện ra và ban sự sống cho Pinocchio. Bà dặn: \"Nếu cháu ngoan và thật thà, cháu sẽ trở thành người thật.\"",
        "Nhưng Pinocchio hay nói dối. Mỗi lần nói dối, cái mũi của cậu lại dài ra một khúc trông rất buồn cười.",
        "Sau nhiều biến cố và thử thách, Pinocchio dũng cảm cứu bác Geppetto khỏi bụng cá voi khổng lồ.",
        "Thấy tấm lòng hiếu thảo của cậu, Bà Tiên Xanh đã biến Pinocchio thành một cậu bé bằng xương bằng thịt."
    ]
  },
  {
    title: "Khỉ Con Học Leo Cây",
    coverColor: "bg-lime-300",
    pages: [
        "Khỉ Con rất sợ độ cao. Trong khi các bạn thoăn thoắt chuyền cành thì cậu chỉ dám ngồi dưới đất.",
        "Khỉ Bố động viên: \"Con hãy nhìn lên cao, đừng nhìn xuống đất. Bố sẽ ở ngay bên cạnh đỡ con.\"",
        "Khỉ Con run rẩy bám vào cành cây thấp nhất. Cậu nhắm mắt lại rồi lấy hết can đảm leo lên cành tiếp theo.",
        "Càng leo cao, Khỉ Con càng thấy thích thú. Cậu nhìn thấy tổ chim, những quả chín mọng và cả khu rừng rộng lớn.",
        "Giờ đây, Khỉ Con là người leo cây giỏi nhất đàn. Cậu hiểu rằng chỉ cần dũng cảm, mọi nỗi sợ sẽ tan biến."
    ]
  },
  {
    title: "Gấu Benny Làm Bánh",
    coverColor: "bg-amber-200",
    pages: [
      "Benny là một chú gấu rất thích nướng bánh. Chú làm ra những chiếc bánh mật ong ngon nhất khu rừng.",
      "Một buổi sáng, Benny nhận ra mình đã hết mật ong! \"Ôi không!\" chú thốt lên.",
      "Chú xách giỏ đi thăm những cô ong thân thiện. \"Cho tớ xin ít mật ong được không?\" chú lễ phép hỏi.",
      "Bầy ong vo ve vui vẻ. \"Tất nhiên rồi, Benny!\" họ nói và rót đầy hũ cho chú.",
      "Benny nướng một chiếc bánh khổng lồ và chia sẻ với tất cả bạn bè. Đó là ngày ngọt ngào nhất trần đời."
    ]
  },
  {
    title: "Chú Khủng Long Ham Ăn",
    coverColor: "bg-lime-200",
    pages: [
        "Trong một thung lũng xanh tươi, có chú khủng long nhỏ tên là Dino. Dino rất ham ăn.",
        "Một hôm, Dino nhìn thấy một quả dưa hấu khổng lồ trên đồi. \"Ngon tuyệt!\" chú reo lên.",
        "Dino cố lăn quả dưa về nhà, nhưng nó nặng quá. Nó lăn ngược lại và đẩy Dino xuống dốc!",
        "Cả Dino và quả dưa lăn \"ùm\" xuống hồ nước mát lạnh. Bắn nước tung tóe khắp nơi.",
        "Dino cười vang và mời các bạn cá cùng ăn dưa hấu. Bữa tiệc bên hồ thật là vui."
    ]
  },
  {
    title: "Mèo Con Đi Học",
    coverColor: "bg-purple-200",
    pages: [
        "Hôm nay là ngày đầu tiên Mèo Con đi học. Chú đeo chiếc ba lô nhỏ màu đỏ.",
        "Trên đường đi, Mèo Con gặp bạn Cún. \"Cậu có lo lắng không?\" Cún hỏi.",
        "\"Hơi hơi ạ,\" Mèo Con đáp. Nhưng khi đến lớp, cô giáo Hươu Cao Cổ đón các bạn bằng một nụ cười.",
        "Mèo Con học vẽ tranh và hát hò. Chú làm quen được với bạn Sóc và bạn Nhím.",
        "Tan học, Mèo Con chạy về khoe với mẹ: \"Đi học vui lắm mẹ ơi! Con muốn đi học mỗi ngày.\""
    ]
  },
   {
    title: "Phi Hành Gia Tí Hon",
    coverColor: "bg-blue-200",
    pages: [
        "Bé Bi mơ ước trở thành phi hành gia. Đêm nào bé cũng ngắm nhìn các vì sao.",
        "Bi biến chiếc hộp các tông cũ thành tàu vũ trụ. \"Sẵn sàng phóng!\" bé hô to.",
        "Tàu vũ trụ \"Vèo\" một cái bay lên trần nhà. Bi trôi lơ lửng giữa những đám mây bông gòn.",
        "Bé đáp xuống hành tinh Sao Hỏa, nơi có những người bạn da xanh thân thiện vẫy tay chào.",
        "Chuyến đi thật tuyệt vời, nhưng đã đến giờ đi ngủ. Bi quay về giường, ôm giấc mơ bay vào vũ trụ."
    ]
  },
  {
    title: "Chú Rùa Chạy Đua",
    coverColor: "bg-teal-200",
    pages: [
        "Rùa con Timmy rất chậm chạp. Các bạn Thỏ thường trêu chọc cậu.",
        "\"Thi chạy không Timmy?\" Thỏ Nâu thách thức. Timmy gật đầu: \"Được thôi!\"",
        "Cuộc đua bắt đầu. Thỏ Nâu chạy vèo một cái đã mất hút. Timmy cứ bước từng bước một.",
        "Thỏ Nâu mải chơi hái hoa bắt bướm nên quên mất cuộc đua. Timmy vẫn kiên trì bò về đích.",
        "Khi Thỏ Nâu nhớ ra và chạy về, Timmy đã ở vạch đích rồi. \"Chậm mà chắc,\" Timmy cười hiền."
    ]
  },
  {
    title: "Ngôi Sao Lạc Lối",
    coverColor: "bg-yellow-200",
    pages: [
        "Trên bầu trời cao tít, có một ngôi sao nhỏ tên là Blink bị rơi xuống trần gian.",
        "Blink rơi vào khu vườn của bạn Sóc. \"Cậu là ai vậy?\" Sóc ngạc nhiên hỏi.",
        "\"Tớ là sao, tớ muốn về nhà,\" Blink thút thít. Sóc gọi các bạn chim đến giúp.",
        "Đại bàng khỏe mạnh cõng Blink bay vút lên cao, xuyên qua những tầng mây.",
        "Blink trở lại bầu trời, tỏa sáng lấp lánh để cảm ơn những người bạn tốt bụng dưới mặt đất."
    ]
  },
  {
    title: "Voi Con Biết Bay",
    coverColor: "bg-pink-200",
    pages: [
        "Voi con Ellie có đôi tai to bất thường. Mọi người hay cười chê đôi tai ấy.",
        "Một hôm, Ellie thấy một chú chim non rơi khỏi tổ. Ellie chạy đến đỡ.",
        "Bất ngờ, đôi tai to của Ellie vẫy vẫy như đôi cánh. Ellie bay lên khỏi mặt đất!",
        "Ellie đưa chú chim về tổ an toàn. Cả đàn voi ngước nhìn đầy thán phục.",
        "Từ đó, Ellie trở thành siêu anh hùng của khu rừng, luôn bay lượn giúp đỡ mọi người."
    ]
  },
  {
    title: "Kiến Thợ Chăm Chỉ",
    coverColor: "bg-red-200",
    pages: [
        "Mùa đông sắp đến, cả đàn kiến đang hối hả tha mồi về tổ. Bé Kiến Nhỏ cũng vác một hạt gạo to.",
        "Trong khi đó, Ve Sầu vẫn mải mê ca hát trên cành cây. \"Kiến ơi, nghỉ tay chơi tí nào,\" Ve Sầu rủ.",
        "\"Không được đâu, tớ phải lo cho mùa đông,\" Kiến Nhỏ đáp và tiếp tục bước đi.",
        "Khi gió lạnh tràn về, Ve Sầu đói meo, run rẩy gõ cửa tổ kiến xin ăn.",
        "Kiến Nhỏ mời Ve Sầu vào nhà ăn súp nóng. Ve Sầu hiểu rằng chăm chỉ làm việc mới có cái ăn."
    ]
  },
  {
    title: "Đám Mây Tinh Nghịch",
    coverColor: "bg-sky-200",
    pages: [
        "Có một Đám Mây Trắng nhỏ rất thích chơi khăm. Lúc thì nó hóa thành con chó, lúc thành cây kem.",
        "Một hôm, nó che mất ông Mặt Trời khiến các bạn hoa hướng dương buồn bã cúi đầu.",
        "Gió Thần thấy vậy liền thổi mạnh. Đám Mây Trắng bay vèo đi, va vào ngọn núi.",
        "Mây Trắng vỡ òa thành những hạt mưa mát lành, tưới tắm cho cánh đồng hoa đang khát nước.",
        "Các bạn hoa vẫy lá cảm ơn. Mây Trắng nhận ra làm việc tốt vui hơn trêu chọc người khác nhiều."
    ]
  },
  {
    title: "Buổi Hòa Nhạc Mùa Xuân",
    coverColor: "bg-emerald-200",
    pages: [
        "Khu rừng tổ chức cuộc thi âm nhạc. Chim Họa Mi luyện giọng, Ếch Xanh tập đánh trống.",
        "Dế Mèn kéo đàn violin rất hay, nhưng cậu ấy nhút nhát không dám lên sân khấu.",
        "Đến lượt Dế Mèn, cậu run rẩy nấp sau cánh gà. Đom Đóm bay đến thắp đèn cổ vũ.",
        "Lấy hết can đảm, Dế Mèn bước ra và kéo một bản nhạc tuyệt vời. Cả khu rừng im lặng lắng nghe.",
        "Tiếng vỗ tay vang dội. Dế Mèn mỉm cười, biết rằng mình đã chiến thắng nỗi sợ hãi."
    ]
  },
  {
    title: "Siêu Nhân Rau Củ",
    coverColor: "bg-green-200",
    pages: [
        "Tí rất ghét ăn rau. Cậu chỉ thích ăn kẹo ngọt và bánh quy.",
        "Đêm đó, Tí mơ thấy Vương Quốc Kẹo bị sâu răng tấn công. \"Cứu chúng tôi với!\" Vua Kẹo kêu cứu.",
        "Đột nhiên, Biệt đội Siêu Nhân Rau Củ xuất hiện! Cà Rốt, Súp Lơ và Cà Chua chiến đấu dũng cảm.",
        "Họ đánh đuổi lũ sâu răng và giúp Vương Quốc Kẹo khỏe mạnh trở lại. Tí reo hò cổ vũ.",
        "Sáng hôm sau, Tí xin mẹ cho ăn thật nhiều rau. Cậu muốn khỏe mạnh như các siêu nhân."
    ]
  },
  {
    title: "Cánh Diều Mơ Ước",
    coverColor: "bg-cyan-200",
    pages: [
        "Bé Na có một chiếc diều giấy tự làm. Nó không đẹp lắm nhưng Na rất quý nó.",
        "Chiều nào Na cũng ra đê thả diều. \"Bay cao lên nào!\" Na thì thầm.",
        "Gió nâng cánh diều bay vút lên bầu trời xanh thẳm. Diều gặp gỡ những đám mây trắng xốp.",
        "Diều nhìn thấy dòng sông uốn lượn và những cánh đồng lúa chín vàng óng ả bên dưới.",
        "Na mỉm cười, gửi gắm ước mơ được bay xa khám phá thế giới vào cánh diều nhỏ bé."
    ]
  },
  {
    title: "Chú Cánh Cam Lạc Mẹ",
    coverColor: "bg-orange-300",
    pages: [
        "Cánh Cam con mải chơi đuổi bắt giọt sương nên bị lạc mất mẹ trong vườn hoa.",
        "Cậu sợ hãi nấp dưới lá hoa hồng. Bác Ong Vàng bay qua thấy vậy liền hỏi thăm.",
        "\"Cháu đừng khóc, bác sẽ giúp,\" bác Ong an ủi. Bác gọi thêm cô Bướm Trắng cùng tìm kiếm.",
        "Họ bay khắp khu vườn, hỏi thăm từng bông hoa. Cuối cùng, họ thấy mẹ Cánh Cam đang lo lắng tìm con.",
        "Cánh Cam ôm chầm lấy mẹ. Cậu hứa từ nay sẽ không bao giờ mải chơi đi lạc nữa."
    ]
  },
  {
    title: "Bữa Tiệc Của Các Loại Quả",
    coverColor: "bg-rose-200",
    pages: [
        "Trong tủ lạnh, các loại quả đang tranh cãi xem ai ngon nhất. Táo đỏ khoe mình giòn ngọt.",
        "Chuối vàng bảo mình thơm lừng. Nho tím nói mình mọng nước. Ai cũng cho mình là nhất.",
        "Bé Bi mở tủ lạnh lấy các loại quả ra làm món hoa quả dầm sữa chua.",
        "Khi trộn lẫn vào nhau, vị ngọt của Táo, thơm của Chuối và chua dịu của Nho hòa quyện tuyệt vời.",
        "Các loại quả hiểu ra rằng khi đoàn kết lại, chúng sẽ tạo nên hương vị ngon nhất."
    ]
  },
  {
    title: "Chuyến Tàu Đêm Giáng Sinh",
    coverColor: "bg-blue-300",
    pages: [
        "Đêm Giáng Sinh, tuyết rơi trắng xóa. Một đoàn tàu đồ chơi bỗng nhiên chuyển động.",
        "Nó chạy quanh cây thông Noel lấp lánh đèn màu. Gấu Bông lái tàu, Búp Bê làm hành khách.",
        "Tàu đi qua những hộp quà rực rỡ, leo lên ngọn đồi gối êm ái.",
        "Họ dừng lại đón thêm chú Lính Chì đang đứng gác. Cả đoàn tàu rộn rã tiếng cười vui.",
        "Sáng hôm sau, bé Bo thức dậy thấy các món đồ chơi nằm im lìm, nhưng dường như chúng đang mỉm cười."
    ]
  },
  {
    title: "Hạt Giống Nhỏ Kiên Cường",
    coverColor: "bg-emerald-300",
    pages: [
        "Có một hạt giống nhỏ nằm sâu trong lòng đất tối tăm. Nó mơ về ánh mặt trời rực rỡ.",
        "Mưa xuống, đất trở nên lạnh lẽo. Nhưng hạt giống vẫn cố gắng nảy mầm, vươn rễ bám chặt.",
        "Nó dùng hết sức đẩy lớp đất nặng nề bên trên. \"Cố lên nào!\" nó tự nhủ.",
        "Cuối cùng, một chồi non xanh mướt nhú lên khỏi mặt đất, đón chào những tia nắng ấm áp.",
        "Hạt giống nhỏ giờ đã trở thành một cây con mạnh mẽ, vẫy lá chào thế giới tươi đẹp."
    ]
  },
  {
    title: "Chiếc Ô Màu Đỏ",
    coverColor: "bg-red-300",
    pages: [
        "Mùa mưa đến, Ếch Con tìm mãi không thấy chiếc lá sen che mưa quen thuộc đâu.",
        "Bỗng nhiên, một cây nấm đỏ rực mọc lên. \"A, chiếc ô đây rồi!\" Ếch Con reo lên.",
        "Ếch Con trú mưa dưới cây nấm. Một chú Chuồn Chuồn ướt sũng bay đến xin trú cùng.",
        "Rồi đến Bọ Rùa và Kiến Nhỏ. Cây nấm dường như to ra để che chở cho tất cả mọi người.",
        "Cơn mưa qua đi, cầu vồng hiện ra. Các bạn nhỏ cảm ơn cây nấm tốt bụng và cùng nhau ca hát."
    ]
  },
  {
    title: "Bạn Mây Đi Đâu Thế",
    coverColor: "bg-sky-300",
    pages: [
        "Mây Trắng trôi lơ lửng trên bầu trời. Gió hỏi: \"Mây đi đâu thế?\"",
        "\"Tớ đi du lịch,\" Mây đáp. Mây bay qua những ngọn núi cao phủ đầy tuyết trắng.",
        "Mây soi mình xuống mặt hồ phẳng lặng như gương. Mây đùa nghịch với những cánh diều.",
        "Khi bay qua vùng đất khô hạn, Mây thương tình hóa thành mưa rơi xuống.",
        "Cây cối vui mừng uống nước thỏa thích. Mây tan biến nhưng niềm vui của Mây vẫn còn mãi."
    ]
  }
];

// --- Audio Utils ---
// Decodes Base64 string to Uint8Array
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM data from Gemini TTS to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Components ---

// Highlighting Story Text Component
const StoryText = ({ text, isPlaying, progress }: { text: string; isPlaying: boolean; progress: number }) => {
    // Basic word splitting - could be improved for Vietnamese compound words but sufficient for demo
    const words = text.split(" ");
    const activeIndex = isPlaying ? Math.floor(progress * words.length) : -1;

    return (
        <span className="leading-relaxed">
            {words.map((word, index) => (
                <span 
                    key={index} 
                    className={`inline-block transition-all duration-200 px-[2px] rounded-md
                        ${index === activeIndex 
                            ? "bg-yellow-200 text-orange-600 scale-110 font-bold" 
                            : isPlaying && index < activeIndex ? "text-gray-800" : ""}`}
                >
                    {word}{" "}
                </span>
            ))}
        </span>
    );
};

// --- New Component: Dynamic Background ---
const DynamicBackground = () => {
  const [particles, setParticles] = useState<{id: number, left: number, duration: number, delay: number, size: number, Icon: any, color: string}[]>([]);

  useEffect(() => {
    const icons = [CloudSun, Star, Music, Sparkles, Smile, Cat, Rocket];
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // %
      duration: 15 + Math.random() * 25, // seconds
      delay: Math.random() * -30, // start immediately
      size: 20 + Math.random() * 40, // px
      Icon: icons[Math.floor(Math.random() * icons.length)],
      color: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.3)`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-up"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <p.Icon 
            size={p.size} 
            style={{ color: p.color }} 
            className="text-gray-400 opacity-40" 
          />
        </div>
      ))}
    </div>
  );
};

// --- Game Components ---

// Mascot Component
const GameMascot = ({ emotion, message }: { emotion: 'happy' | 'sad' | 'thinking' | 'idle', message?: string }) => {
    return (
        <div className="flex flex-col items-center animate-slide-up">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 animate-breathe
                ${emotion === 'happy' ? 'bg-yellow-100 border-yellow-400 scale-110' : 
                  emotion === 'sad' ? 'bg-blue-100 border-blue-400' : 
                  emotion === 'thinking' ? 'bg-purple-100 border-purple-400 animate-pulse' : 
                  'bg-white border-gray-300'}`}>
                
                {emotion === 'happy' && <Smile className="w-16 h-16 text-yellow-500 animate-bounce" />}
                {emotion === 'sad' && <Frown className="w-16 h-16 text-blue-500" />}
                {emotion === 'thinking' && <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />}
                {emotion === 'idle' && <Cat className="w-16 h-16 text-gray-500" />}

                {/* Thought Bubble */}
                {message && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-gray-200 whitespace-nowrap z-10 animate-slide-up">
                        <span className="text-gray-700 font-bold">{message}</span>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  const [cards, setCards] = useState<{id: number, icon: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const duplicatedIcons = [...ICONS, ...ICONS];
    const shuffled = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      if (newCards[firstIndex].icon === newCards[secondIndex].icon) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 z-10">
      <div className="flex justify-between w-full items-center mb-6">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
        <h2 className="text-3xl font-bold text-violet-600">Lật Hình</h2>
        <div className="text-xl font-bold text-gray-500">Lượt: {moves}</div>
      </div>

      {isWon ? (
        <div className="text-center py-10 animate-slide-up flex flex-col items-center">
           <GameMascot emotion="happy" message="Tuyệt vời quá!" />
           <div className="h-8"></div>
           <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
           <h3 className="text-4xl font-bold text-green-500 mb-4">Chiến Thắng!</h3>
           <p className="text-xl text-gray-600 mb-8">Bé giỏi quá đi mất!</p>
           <button 
             onClick={() => window.location.reload()} 
             className="px-8 py-3 bg-violet-500 text-white rounded-full font-bold text-xl hover:bg-violet-600 hover:scale-110 transition-transform"
           >
             Chơi Lại
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 w-full aspect-square">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`relative rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
            >
               <div className={`w-full h-full absolute flex items-center justify-center text-4xl bg-white rounded-xl shadow-md backface-hidden transition-all
                  ${card.isFlipped || card.isMatched ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}`}>
                  {card.icon}
               </div>
               <div className={`w-full h-full flex items-center justify-center bg-violet-200 rounded-xl shadow-md border-2 border-violet-300
                  ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}`}>
                  <HelpCircle className="text-violet-400 w-8 h-8" />
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MathQuiz = ({ onBack }: { onBack: () => void }) => {
  const [problem, setProblem] = useState({ a: 0, b: 0, ans: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ans = a + b;
    const opts = new Set<number>();
    opts.add(ans);
    while (opts.size < 4) {
      const r = Math.floor(Math.random() * 20) + 1;
      if (r !== ans) opts.add(r);
    }
    setProblem({ a, b, ans });
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleAnswer = (val: number) => {
    if (val === problem.ans) {
      setScore(s => s + 1);
      setFeedback("correct");
      setTimeout(generateProblem, 1500);
    } else {
      setFeedback("wrong");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 z-10">
       <div className="flex justify-between w-full items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
        <h2 className="text-3xl font-bold text-sky-600">Đố Vui Toán Học</h2>
        <div className="flex items-center gap-2 text-xl font-bold text-orange-500">
           <Star className="fill-current animate-spin-slow" /> {score}
        </div>
      </div>
      
      {/* Mascot Area */}
      <div className="mb-6">
         <GameMascot 
            emotion={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : 'thinking'} 
            message={feedback === 'correct' ? 'Đúng rồi! Hoan hô!' : feedback === 'wrong' ? 'Sai rồi, thử lại nhé!' : 'Bé tính xem nào?'}
         />
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-lg w-full text-center mb-8 border-4 border-sky-100 animate-breathe">
        <div className="text-6xl font-bold text-gray-700 mb-2">
           {problem.a} + {problem.b} = ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="p-6 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-2xl text-3xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const ShapeSorter = ({ onBack }: { onBack: () => void }) => {
  const [currentShape, setCurrentShape] = useState<"circle" | "square" | "triangle">("circle");
  const [options, setOptions] = useState<{id: number, type: "circle" | "square" | "triangle", color: string}[]>([]);
  const [score, setScore] = useState(0);
  const [mascotState, setMascotState] = useState<'idle'|'happy'|'sad'>('idle');

  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
    const target = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentShape(target);
    setMascotState('idle');

    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"];
    const newOptions = Array.from({ length: 3 }).map((_, i) => ({
      id: Math.random(),
      type: i === 0 ? target : shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    })).sort(() => Math.random() - 0.5);

    setOptions(newOptions);
  };

  const handleSelect = (type: string) => {
    if (type === currentShape) {
      setScore(s => s + 1);
      setMascotState('happy');
      setTimeout(generateRound, 1000);
    } else {
        setMascotState('sad');
        setTimeout(() => setMascotState('idle'), 1000);
    }
  };

  const renderShape = (type: string, colorClass: string) => {
    if (type === "circle") return <div className={`w-20 h-20 rounded-full ${colorClass}`} />;
    if (type === "square") return <div className={`w-20 h-20 rounded-xl ${colorClass}`} />;
    if (type === "triangle") return <div className={`w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-current text-${colorClass.replace('bg-', '')}`} />;
    return null;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 z-10">
      <div className="flex justify-between w-full items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
        <h2 className="text-3xl font-bold text-pink-600">Phân Loại Hình</h2>
        <div className="flex items-center gap-2 text-xl font-bold text-orange-500">
           <Star className="fill-current" /> {score}
        </div>
      </div>

       {/* Mascot Area */}
      <div className="mb-6">
         <GameMascot 
            emotion={mascotState} 
            message={mascotState === 'happy' ? 'Chính xác!' : mascotState === 'sad' ? 'Ôi, không phải rồi' : `Bé tìm hình ${currentShape === "circle" ? "tròn" : currentShape === "square" ? "vuông" : "tam giác"} nhé!`}
         />
      </div>

      <div className="text-center mb-8">
        <div className="p-8 bg-white rounded-3xl shadow-md inline-block animate-breathe">
             {currentShape === "circle" && <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300" />}
             {currentShape === "square" && <div className="w-24 h-24 rounded-xl border-4 border-dashed border-gray-300" />}
             {currentShape === "triangle" && <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[100px] border-b-gray-200" />}
        </div>
      </div>

      <div className="flex gap-6 justify-center w-full">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.type)}
            className="p-4 bg-white rounded-2xl shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          >
             {/* Simple shape rendering */}
             {opt.type === "circle" && <div className={`w-20 h-20 rounded-full ${opt.color}`} />}
             {opt.type === "square" && <div className={`w-20 h-20 rounded-xl ${opt.color}`} />}
             {opt.type === "triangle" && (
                 <div className="w-20 h-20 flex items-center justify-center">
                    <div style={{
                        width: 0, height: 0, 
                        borderLeft: '40px solid transparent',
                        borderRight: '40px solid transparent', 
                        borderBottom: '70px solid',
                        color: opt.color.replace('bg-', '') === 'red-400' ? '#f87171' : 
                               opt.color.replace('bg-', '') === 'blue-400' ? '#60a5fa' :
                               opt.color.replace('bg-', '') === 'green-400' ? '#4ade80' :
                               opt.color.replace('bg-', '') === 'yellow-400' ? '#facc15' : '#c084fc'
                    }} />
                 </div>
             )}
          </button>
        ))}
      </div>
    </div>
  );
}

const XylophoneGame = ({ onBack }: { onBack: () => void }) => {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  
  // Audio context for the game
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playNote = (frequency: number, noteName: string) => {
    if (!audioCtxRef.current) return;
    
    setActiveNote(noteName);
    setTimeout(() => setActiveNote(null), 200);

    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    
    gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 1);
  };

  const NOTES = [
    { name: 'C', freq: 261.63, color: 'bg-red-400', height: 'h-64' },
    { name: 'D', freq: 293.66, color: 'bg-orange-400', height: 'h-60' },
    { name: 'E', freq: 329.63, color: 'bg-yellow-400', height: 'h-56' },
    { name: 'F', freq: 349.23, color: 'bg-green-400', height: 'h-52' },
    { name: 'G', freq: 392.00, color: 'bg-teal-400', height: 'h-48' },
    { name: 'A', freq: 440.00, color: 'bg-blue-400', height: 'h-44' },
    { name: 'B', freq: 493.88, color: 'bg-indigo-400', height: 'h-40' },
    { name: 'C5', freq: 523.25, color: 'bg-purple-400', height: 'h-36' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 z-10">
      <div className="flex justify-between w-full items-center mb-8">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
        <h2 className="text-3xl font-bold text-teal-600">Bé Làm Nhạc Sĩ</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white/50 p-8 rounded-3xl shadow-xl flex items-end justify-center gap-2 md:gap-4 h-96 w-full animate-breathe">
        {NOTES.map((note) => (
          <button
            key={note.name}
            onMouseDown={() => playNote(note.freq, note.name)}
            // Support touch for mobile
            onTouchStart={(e) => { e.preventDefault(); playNote(note.freq, note.name); }}
            className={`w-12 md:w-20 ${note.height} ${note.color} rounded-b-xl rounded-t-sm shadow-md transition-all active:scale-95 active:brightness-110 flex items-end justify-center pb-4 hover:brightness-110
              ${activeNote === note.name ? 'scale-95 brightness-110 ring-4 ring-white' : ''}`}
          >
            <span className="text-white font-bold text-xl">{note.name}</span>
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-xl text-gray-500 font-medium animate-bounce">
        Bé hãy nhấn vào các phím đàn nhé! 🎵
      </p>
    </div>
  );
};

const WhackAMoleGame = ({ onBack }: { onBack: () => void }) => {
    const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    
    useEffect(() => {
        if (gameOver) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const moleTimer = setInterval(() => {
            const newMoles = Array(9).fill(false);
            const randomIndex = Math.floor(Math.random() * 9);
            newMoles[randomIndex] = true;
            setMoles(newMoles);
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(moleTimer);
        };
    }, [gameOver]);

    const handleWhack = (index: number) => {
        if (moles[index]) {
            setScore(s => s + 1);
            const newMoles = [...moles];
            newMoles[index] = false;
            setMoles(newMoles);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 z-10">
             <div className="flex justify-between w-full items-center mb-6">
                <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
                <h2 className="text-3xl font-bold text-amber-700">Đập Chuột</h2>
                <div className="flex items-center gap-4 text-xl font-bold text-gray-700">
                    <span className="flex items-center gap-1 text-red-500"><Timer className="w-6 h-6" /> {timeLeft}s</span>
                    <span className="flex items-center gap-1 text-orange-500"><Star className="w-6 h-6 fill-current" /> {score}</span>
                </div>
            </div>

            {gameOver ? (
                <div className="text-center py-10 animate-slide-up flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl">
                   <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                   <h3 className="text-4xl font-bold text-amber-600 mb-4">Hết Giờ!</h3>
                   <p className="text-2xl text-gray-600 mb-8">Bé đập được <span className="font-bold text-orange-500">{score}</span> chú chuột!</p>
                   <button 
                     onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); }} 
                     className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold text-xl hover:bg-amber-600"
                   >
                     Chơi Lại
                   </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 p-4 bg-amber-800 rounded-3xl shadow-inner border-8 border-amber-900 animate-breathe">
                    {moles.map((isUp, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleWhack(idx)}
                            className="w-24 h-24 md:w-32 md:h-32 bg-amber-950 rounded-full relative overflow-hidden cursor-pointer shadow-inner flex justify-center items-end"
                        >
                            <div className={`transition-all duration-100 transform ${isUp ? 'translate-y-0' : 'translate-y-full'}`}>
                                <Rat className="w-20 h-20 text-gray-400 fill-gray-300" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ColorMixingGame = ({ onBack }: { onBack: () => void }) => {
    const MIXES = [
        { c1: 'bg-red-500', c2: 'bg-yellow-500', res: 'bg-orange-500', name: 'Cam' },
        { c1: 'bg-blue-500', c2: 'bg-yellow-500', res: 'bg-green-500', name: 'Xanh Lá' },
        { c1: 'bg-red-500', c2: 'bg-blue-500', res: 'bg-purple-500', name: 'Tím' },
        { c1: 'bg-white', c2: 'bg-red-500', res: 'bg-pink-400', name: 'Hồng' },
    ];

    const [currentMix, setCurrentMix] = useState(MIXES[0]);
    const [options, setOptions] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'idle'|'correct'|'wrong'>('idle');

    useEffect(() => {
        newRound();
    }, []);

    const newRound = () => {
        const mix = MIXES[Math.floor(Math.random() * MIXES.length)];
        setCurrentMix(mix);
        
        // Generate options including correct answer
        const wrongOpts = MIXES.filter(m => m.res !== mix.res).map(m => m.res);
        const opts = [mix.res, ...wrongOpts.slice(0, 2)].sort(() => Math.random() - 0.5);
        setOptions(opts);
        setFeedback('idle');
    };

    const handleGuess = (color: string) => {
        if (color === currentMix.res) {
            setScore(s => s + 1);
            setFeedback('correct');
            setTimeout(newRound, 1000);
        } else {
            setFeedback('wrong');
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 z-10">
             <div className="flex justify-between w-full items-center mb-6">
                <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
                <h2 className="text-3xl font-bold text-indigo-600">Pha Màu</h2>
                 <div className="flex items-center gap-2 text-xl font-bold text-orange-500">
                   <Star className="fill-current" /> {score}
                </div>
            </div>

            <GameMascot 
                emotion={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : 'thinking'}
                message={feedback === 'correct' ? 'Đúng rồi!' : feedback === 'wrong' ? 'Sai rồi!' : 'Màu gì sẽ hiện ra nhỉ?'}
            />

            <div className="flex items-center gap-4 my-8 animate-breathe">
                <div className={`w-24 h-24 rounded-full shadow-lg ${currentMix.c1} border-4 border-white`}></div>
                <span className="text-4xl font-bold text-gray-400">+</span>
                <div className={`w-24 h-24 rounded-full shadow-lg ${currentMix.c2} border-4 border-white`}></div>
                <span className="text-4xl font-bold text-gray-400">=</span>
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-3xl text-gray-400">?</span>
                </div>
            </div>

            <div className="flex gap-4">
                {options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => handleGuess(opt)}
                        className={`w-20 h-20 rounded-full shadow-lg ${opt} border-4 border-white hover:scale-110 transition-transform`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- NEW GAMES ---

const DrawingGame = ({ onBack }: { onBack: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = (e as React.MouseEvent).clientX - rect.left;
        y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
      }
  };

  const saveDrawing = () => {
     const canvas = canvasRef.current;
     if (canvas) {
         const link = document.createElement('a');
         link.download = 'my-drawing.png';
         link.href = canvas.toDataURL();
         link.click();
     }
  };

  const COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#A52A2A"];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 h-screen z-10">
       <div className="flex justify-between w-full items-center mb-2">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
        <h2 className="text-3xl font-bold text-pink-600">Bé Họa Sĩ</h2>
        <div className="flex gap-2">
            <button onClick={clearCanvas} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 hover-wobble" title="Xóa hết"><RefreshCw className="w-6 h-6" /></button>
            <button onClick={saveDrawing} className="p-2 bg-green-100 text-green-500 rounded-full hover:bg-green-200 hover-wobble" title="Tải về"><Download className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-xl shadow-lg border-4 border-gray-200 relative overflow-hidden touch-none">
          <canvas 
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
      </div>

      <div className="mt-4 w-full bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap justify-center">
              {COLORS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setColor(c)} 
                    className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-gray-200'}`}
                    style={{backgroundColor: c}}
                  />
              ))}
               <button 
                    onClick={() => setColor("#FFFFFF")} 
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-gray-100 hover:scale-110 transition-transform ${color === "#FFFFFF" ? 'border-gray-800 scale-110' : 'border-gray-200'}`}
                    title="Tẩy"
               >
                   <Eraser className="w-6 h-6 text-gray-600" />
               </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
              <Pencil className="w-5 h-5 text-gray-500" />
              <input 
                type="range" 
                min="1" max="50" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full md:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="w-10 h-10 rounded-full bg-black flex-shrink-0" style={{width: brushSize, height: brushSize, backgroundColor: color === "#FFFFFF" ? 'gray' : color}}></div>
          </div>
      </div>
    </div>
  );
};

const JigsawGame = ({ onBack }: { onBack: () => void }) => {
    // A reliable image from Wikimedia Commons
    const IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg";
    const [tiles, setTiles] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        shuffleTiles();
    }, []);

    const shuffleTiles = () => {
        let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        // Simple shuffle: swap random pair 20 times
        for (let i = 0; i < 20; i++) {
             const r1 = Math.floor(Math.random() * 9);
             const r2 = Math.floor(Math.random() * 9);
             [arr[r1], arr[r2]] = [arr[r2], arr[r1]];
        }
        setTiles(arr);
        setIsSolved(false);
        setMoves(0);
        setSelectedTile(null);
    };

    const [selectedTile, setSelectedTile] = useState<number | null>(null);

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        if (selectedTile === null) {
            setSelectedTile(index);
        } else {
            // Swap
            if (selectedTile !== index) {
                const newTiles = [...tiles];
                [newTiles[selectedTile], newTiles[index]] = [newTiles[index], newTiles[selectedTile]];
                setTiles(newTiles);
                setMoves(m => m + 1);
                checkWin(newTiles);
            }
            setSelectedTile(null);
        }
    };

    const checkWin = (currentTiles: number[]) => {
        const win = currentTiles.every((val, index) => val === index);
        if (win) setIsSolved(true);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 z-10">
             <div className="flex justify-between w-full items-center mb-6">
                <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
                <h2 className="text-3xl font-bold text-blue-600">Ghép Tranh</h2>
                <div className="text-xl font-bold text-gray-500">Lượt: {moves}</div>
            </div>

            {isSolved && (
                <div className="mb-6 animate-slide-up flex flex-col items-center">
                    <GameMascot emotion="happy" message="Hoàn thành!" />
                </div>
            )}

            <div className="relative w-80 h-80 bg-gray-200 rounded-xl overflow-hidden shadow-2xl border-4 border-white grid grid-cols-3 grid-rows-3 gap-0.5 animate-breathe">
                {tiles.map((tileIndex, visualIndex) => {
                    const row = Math.floor(tileIndex / 3);
                    const col = tileIndex % 3;
                    return (
                        <div 
                            key={visualIndex}
                            onClick={() => handleTileClick(visualIndex)}
                            className={`relative cursor-pointer transition-all duration-200 
                                ${selectedTile === visualIndex ? 'brightness-125 z-10 scale-105 shadow-lg border-2 border-yellow-400' : ''}
                                ${isSolved ? 'border-none' : ''}
                            `}
                            style={{
                                backgroundImage: `url(${IMAGE_URL})`,
                                backgroundSize: '320px 320px',
                                backgroundPosition: `-${col * 106.6}px -${row * 106.6}px`, // 320 / 3 ≈ 106.66
                                width: '100%',
                                height: '100%'
                            }}
                        >
                           {!isSolved && <span className="absolute bottom-1 right-1 text-xs bg-white/50 px-1 rounded-sm text-gray-800 font-bold">{tileIndex + 1}</span>}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex gap-4">
                 <button onClick={shuffleTiles} className="px-6 py-2 bg-blue-100 text-blue-600 rounded-full font-bold hover:bg-blue-200 flex items-center gap-2 hover-wobble">
                     <RefreshCw className="w-5 h-5" /> Trộn lại
                 </button>
            </div>
        </div>
    );
};

const WordMatchGame = ({ onBack }: { onBack: () => void }) => {
    const DATA = [
        { id: 1, icon: '🍎', word: 'Quả Táo' },
        { id: 2, icon: '🐱', word: 'Con Mèo' },
        { id: 3, icon: '🚗', word: 'Ô Tô' },
        { id: 4, icon: '🌞', word: 'Mặt Trời' },
        { id: 5, icon: '🏠', word: 'Ngôi Nhà' },
    ];

    const [leftItems, setLeftItems] = useState(DATA);
    const [rightItems, setRightItems] = useState<typeof DATA>([]);
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [matchedIds, setMatchedIds] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);

    useEffect(() => {
        setRightItems([...DATA].sort(() => Math.random() - 0.5));
    }, []);

    const handleLeftClick = (id: number) => {
        if (matchedIds.includes(id)) return;
        setSelectedLeft(id);
        setFeedback(null);
    };

    const handleRightClick = (id: number) => {
        if (matchedIds.includes(id) || selectedLeft === null) return;

        if (selectedLeft === id) {
            setMatchedIds([...matchedIds, id]);
            setFeedback('correct');
            setSelectedLeft(null);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 500);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 z-10">
             <div className="flex justify-between w-full items-center mb-6">
                <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble"><ChevronLeft /></button>
                <h2 className="text-3xl font-bold text-green-600">Nối Từ</h2>
                 <div className="flex items-center gap-2 text-xl font-bold text-orange-500">
                   <Star className="fill-current" /> {matchedIds.length}
                </div>
            </div>

            <div className="mb-4 h-16">
                 {matchedIds.length === DATA.length ? (
                      <GameMascot emotion="happy" message="Bé giỏi quá!" />
                 ) : (
                      <GameMascot 
                        emotion={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : 'idle'} 
                        message={feedback === 'correct' ? 'Đúng rồi!' : feedback === 'wrong' ? 'Sai rồi!' : 'Bé hãy chọn hình rồi chọn chữ nhé!'} 
                      />
                 )}
            </div>

            <div className="flex w-full justify-between gap-8">
                {/* Left Column (Icons) */}
                <div className="flex flex-col gap-4 flex-1">
                    {leftItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleLeftClick(item.id)}
                            disabled={matchedIds.includes(item.id)}
                            className={`h-20 rounded-2xl shadow-md text-4xl flex items-center justify-center transition-all border-4 
                                ${matchedIds.includes(item.id) ? 'bg-green-100 border-green-300 opacity-50' : 
                                  selectedLeft === item.id ? 'bg-blue-100 border-blue-400 scale-105' : 'bg-white border-white hover:bg-gray-50'}`}
                        >
                            {matchedIds.includes(item.id) ? <Check className="text-green-500 w-8 h-8" /> : item.icon}
                        </button>
                    ))}
                </div>

                {/* Right Column (Words) */}
                <div className="flex flex-col gap-4 flex-1">
                     {rightItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleRightClick(item.id)}
                            disabled={matchedIds.includes(item.id)}
                            className={`h-20 rounded-2xl shadow-md text-lg md:text-xl font-bold flex items-center justify-center transition-all border-4
                                 ${matchedIds.includes(item.id) ? 'bg-green-100 border-green-300 text-green-700 opacity-50' : 
                                   (feedback === 'wrong' && selectedLeft !== null) ? 'bg-white border-white' : // don't highlight wrong unless specifically handled
                                   'bg-white border-white hover:bg-gray-50 text-gray-700'}`}
                        >
                            {item.word}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  settings: AppSettings, 
  onUpdate: (s: AppSettings) => void 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cài Đặt</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover-wobble">
             <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Background Theme */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-600 font-bold mb-3">
             <Palette className="w-5 h-5" /> Giao diện đọc
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => onUpdate({...settings, bgTheme: theme.id})}
                className={`h-12 rounded-xl border-2 ${theme.class} ${settings.bgTheme === theme.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'}`}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Reading Speed */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-600 font-bold mb-3">
             <Gauge className="w-5 h-5" /> Tốc độ đọc
          </label>
          <div className="flex justify-between bg-gray-100 rounded-xl p-1">
             {[0.8, 1, 1.2].map(speed => (
               <button
                 key={speed}
                 onClick={() => onUpdate({...settings, readingSpeed: speed})}
                 className={`flex-1 py-2 rounded-lg font-bold transition-all ${settings.readingSpeed === speed ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
               >
                 {speed === 1 ? 'Bình thường' : speed < 1 ? 'Chậm' : 'Nhanh'}
               </button>
             ))}
          </div>
        </div>

        {/* Music */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-600 font-bold mb-3">
             <Music className="w-5 h-5" /> Nhạc nền
          </label>
          <select 
            className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-200 mb-3"
            value={settings.musicTrackIndex}
            onChange={(e) => onUpdate({...settings, musicTrackIndex: Number(e.target.value)})}
          >
            {MUSIC_TRACKS.map((track, i) => (
              <option key={i} value={i}>{track.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <Volume2 className="text-gray-400 w-5 h-5" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => onUpdate({...settings, musicVolume: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 hover:scale-105 transition-transform"
        >
          Xong
        </button>
      </div>
    </div>
  );
};


// --- App Component ---

const App = () => {
  // State
  const [view, setView] = useState<"home" | "reading" | "creating" | "games">("home");
  const [activeGame, setActiveGame] = useState<"menu" | "memory" | "math" | "shape" | "music" | "mole" | "color" | "drawing" | "jigsaw" | "word">("menu");
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [assets, setAssets] = useState<Record<number, PageAssets>>({});
  const [promptInput, setPromptInput] = useState("");
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null); // For creating view
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  
  // Audio Progress State for Karaoke
  const [audioProgress, setAudioProgress] = useState(0);

  // Persistence & Settings
  const [readHistory, setReadHistory] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    bgTheme: 'default',
    musicVolume: 0.1,
    musicTrackIndex: 0,
    readingSpeed: 1,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedHistory = localStorage.getItem('readHistory');
    if (savedHistory) {
      setReadHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save Settings when changed
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Initialize AudioContext & Background Music
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Setup background music
    const audio = new Audio(MUSIC_TRACKS[settings.musicTrackIndex].url);
    audio.loop = true;
    audio.volume = settings.musicVolume; 
    bgMusicRef.current = audio;

    return () => {
      audioContextRef.current?.close();
      audio.pause();
      bgMusicRef.current = null;
    };
  }, []);

  // Handle Music Track Change
  useEffect(() => {
    if (bgMusicRef.current) {
        bgMusicRef.current.src = MUSIC_TRACKS[settings.musicTrackIndex].url;
        if (view === "reading" || view === "games") {
            bgMusicRef.current.play().catch(console.warn);
        }
    }
  }, [settings.musicTrackIndex]);

  // Handle Volume Change
  useEffect(() => {
    if (bgMusicRef.current) {
        // Apply ducking logic immediately if needed, or base volume
        const targetVol = isPlaying ? settings.musicVolume * 0.3 : settings.musicVolume;
        bgMusicRef.current.volume = targetVol;
    }
  }, [settings.musicVolume, isPlaying]);


  // --- Background Music Logic ---

  // Handle Play/Pause based on view
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    if (view === "reading" || view === "games") {
      // Play music in reading and game modes
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Auto-play prevented:", error);
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [view]);

  // --- API Functions ---

  const generateNewStory = async (topic: string) => {
    setIsCreatingStory(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        // Updated prompt to request story in Vietnamese
        contents: `Viết một câu chuyện ngắn cho trẻ em về: ${topic}. Câu chuyện cần có tiêu đề và chính xác 5 trang văn bản đơn giản bằng Tiếng Việt (Vietnamese).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              pages: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "pages"],
          },
        },
      });

      const json = JSON.parse(response.text || "{}");
      if (json.title && json.pages) {
        const newStory: Story = {
          title: json.title,
          pages: json.pages,
          coverColor: "bg-emerald-200",
        };
        startStory(newStory);
      }
    } catch (e) {
      console.error("Failed to generate story", e);
      alert("Úi! Không viết được truyện rồi. Thử lại nhé?");
    } finally {
      setIsCreatingStory(false);
    }
  };

  const generateAssetsForPage = async (story: Story, index: number) => {
    // Initialize asset entry if missing
    setAssets((prev) => ({
      ...prev,
      [index]: { ...prev[index], isGeneratingImage: !prev[index]?.imageUrl, isGeneratingAudio: !prev[index]?.audioBuffer },
    }));

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const text = story.pages[index];

    // 1. Generate Image (if needed)
    if (!assets[index]?.imageUrl) {
      (async () => {
        try {
          // Providing the Vietnamese text as context for the image generator
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            // UPDATED PROMPT: Requesting characters to "act out the scene" and "expressive emotions"
            contents: `Children's book illustration for the following story page: "${text}". The characters should be acting out the scene described with expressive emotions. Style: vector art, colorful, cute, simple, dynamic composition.`,
            config: {
                // No responseMimeType for image models
            }
          });
          
          let imageUrl = "";
          // Find image part
          if (response.candidates?.[0]?.content?.parts) {
             for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
             }
          }

          if (imageUrl) {
            setAssets((prev) => ({
              ...prev,
              [index]: { ...prev[index], imageUrl, isGeneratingImage: false },
            }));
          } else {
             setAssets((prev) => ({
              ...prev,
              [index]: { ...prev[index], isGeneratingImage: false },
            }));
          }
        } catch (e) {
          console.error("Image gen failed", e);
          setAssets((prev) => ({
            ...prev,
            [index]: { ...prev[index], isGeneratingImage: false },
          }));
        }
      })();
    }

    // 2. Generate Audio (if needed)
    if (!assets[index]?.audioBuffer) {
      (async () => {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text }] }, // Passing Vietnamese text directly
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Puck" },
                },
              },
            },
          });

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            const audioBuffer = await decodeAudioData(
              decodeBase64(base64Audio),
              audioContextRef.current,
              24000,
              1
            );
            setAssets((prev) => ({
              ...prev,
              [index]: { ...prev[index], audioBuffer, isGeneratingAudio: false },
            }));
          } else {
             setAssets((prev) => ({
              ...prev,
              [index]: { ...prev[index], isGeneratingAudio: false },
            }));
          }
        } catch (e) {
          console.error("TTS failed", e);
          setAssets((prev) => ({
            ...prev,
            [index]: { ...prev[index], isGeneratingAudio: false },
          }));
        }
      })();
    }
  };

  // --- Voice Input Helper ---
  const toggleListening = () => {
    if (isListening) {
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Trình duyệt này không hỗ trợ nhập liệu bằng giọng nói.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; // Vietnamese
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPromptInput(prev => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  };

  // --- Helpers ---

  const startStory = (story: Story) => {
    // Add to History
    if (!readHistory.includes(story.title)) {
        const newHistory = [...readHistory, story.title];
        setReadHistory(newHistory);
        localStorage.setItem('readHistory', JSON.stringify(newHistory));
    }

    setCurrentStory(story);
    setPageIndex(0);
    setAssets({});
    setReadingMode(false); // Reset reading mode
    setView("reading");
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const pickRandomStory = () => {
    const randomIndex = Math.floor(Math.random() * PREDEFINED_STORIES.length);
    startStory(PREDEFINED_STORIES[randomIndex]);
  };

  const playCurrentAudio = async () => {
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
      setIsPlaying(false);
      setAudioProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const buffer = assets[pageIndex]?.audioBuffer;
    if (buffer && audioContextRef.current) {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      // Apply Reading Speed
      source.playbackRate.value = settings.readingSpeed; 
      
      source.connect(audioContextRef.current.destination);
      
      // Animation frame loop for progress tracking
      startTimeRef.current = audioContextRef.current.currentTime;
      const duration = buffer.duration / settings.readingSpeed;

      const animate = () => {
        if (!activeSourceRef.current) return;
        const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        setAudioProgress(progress);

        if (progress < 1) {
            rafRef.current = requestAnimationFrame(animate);
        } else {
            setAudioProgress(0);
            setIsPlaying(false);
            activeSourceRef.current = null;
        }
      };

      source.onended = () => {
          setIsPlaying(false);
          setAudioProgress(0);
          activeSourceRef.current = null;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
      
      activeSourceRef.current = source;
      source.start();
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  // Effect to trigger generation when page changes
  useEffect(() => {
    if (view === "reading" && currentStory) {
      // Generate current page assets
      generateAssetsForPage(currentStory, pageIndex);
      // Stop audio when changing pages
      if (activeSourceRef.current) {
          activeSourceRef.current.stop();
          activeSourceRef.current = null;
          setIsPlaying(false);
          setAudioProgress(0);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }
    }
  }, [view, currentStory, pageIndex]);

  // Get current theme object
  const currentTheme = BACKGROUND_THEMES.find(t => t.id === settings.bgTheme) || BACKGROUND_THEMES[0];

  // --- Render Functions ---

  if (view === "home") {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center overflow-auto relative">
        <DynamicBackground />
        
        <h1 className="text-5xl font-bold text-sky-600 mb-2 drop-shadow-sm z-10 animate-breathe">Truyện Kể Bé Nghe</h1>
        <p className="text-xl text-sky-400 mb-8 z-10">Chọn một truyện hoặc tự viết truyện mới nhé!</p>

        <button 
          onClick={pickRandomStory}
          className="mb-8 px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full font-bold text-xl shadow-lg flex items-center gap-3 transition-transform transform hover:scale-110 active:scale-95 z-10 hover-wobble"
        >
          <Shuffle className="w-6 h-6" />
          Kể Ngẫu Nhiên
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full pb-10 z-10">
          {/* Create New Card */}
          <div 
            onClick={() => setView("creating")}
            className="bg-white rounded-3xl p-6 shadow-xl border-4 border-dashed border-pink-300 hover:border-pink-400 cursor-pointer transform hover:-translate-y-2 hover:scale-105 transition-all flex flex-col items-center justify-center min-h-[250px] group animate-slide-up"
          >
            <div className="bg-pink-100 p-6 rounded-full mb-4 group-hover:bg-pink-200 transition-colors animate-bounce">
              <Sparkles className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-pink-500 text-center">Tạo Phép Màu!</h3>
            <p className="text-gray-400 text-center mt-2">Tự viết truyện của bé</p>
          </div>

          {/* Games Card */}
          <div 
            onClick={() => { setView("games"); setActiveGame("menu"); }}
            className="bg-white rounded-3xl p-6 shadow-xl border-4 border-dashed border-violet-300 hover:border-violet-400 cursor-pointer transform hover:-translate-y-2 hover:scale-105 transition-all flex flex-col items-center justify-center min-h-[250px] group animate-slide-up"
          >
            <div className="bg-violet-100 p-6 rounded-full mb-4 group-hover:bg-violet-200 transition-colors animate-bounce">
              <Gamepad2 className="w-12 h-12 text-violet-500" />
            </div>
            <h3 className="text-2xl font-bold text-violet-500 text-center">Góc Vui Chơi</h3>
            <p className="text-gray-400 text-center mt-2">Vừa chơi vừa học</p>
          </div>

          {/* Predefined Stories */}
          {PREDEFINED_STORIES.map((story, i) => {
            const isRead = readHistory.includes(story.title);
            return (
            <div
              key={i}
              onClick={() => startStory(story)}
              className={`relative overflow-hidden ${story.coverColor} rounded-3xl p-6 shadow-xl cursor-pointer transform hover:-translate-y-2 hover:scale-105 transition-all flex flex-col justify-between min-h-[250px] animate-slide-up`}
            >
              <div className="absolute -right-4 -top-4 bg-white/30 w-32 h-32 rounded-full blur-2xl"></div>
              
              {/* Read Indicator */}
              {isRead && (
                  <div className="absolute top-4 right-4 bg-white/80 p-1 rounded-full shadow-sm animate-pulse" title="Đã đọc">
                     <Check className="w-5 h-5 text-green-600" />
                  </div>
              )}

              <div>
                 <BookOpen className="w-10 h-10 text-gray-700 opacity-50 mb-4" />
                 <h3 className="text-3xl font-bold text-gray-800 leading-tight">{story.title}</h3>
              </div>
              <div className="flex justify-end mt-4">
                 <span className="bg-white/50 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">Đọc ngay</span>
              </div>
            </div>
          )})}
        </div>
      </div>
    );
  }

  if (view === "creating") {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        <DynamicBackground />
        <div className="bg-white rounded-3xl p-6 md:p-10 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 z-10 animate-slide-up">
          
          <button 
            onClick={() => setView("home")}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 z-10 hover-wobble"
          >
            <Home className="w-8 h-8" />
          </button>

          {/* Left Panel: Input */}
          <div className="flex-1 flex flex-col pt-12">
              <div className="mb-4 inline-flex items-center gap-3">
                <div className="bg-pink-100 p-3 rounded-full animate-bounce">
                  <Sparkles className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Tạo Truyện Mới</h2>
              </div>
              
              <p className="text-gray-500 mb-6">Bé muốn nghe kể chuyện về gì nào? Hãy chọn một chủ đề hoặc tự nhập nhé!</p>
              
              <div className="relative w-full mb-6 flex-1">
                <textarea
                  className="w-full h-full min-h-[150px] bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 pr-16 text-xl focus:border-pink-400 focus:ring-0 outline-none transition-all text-gray-700 resize-none"
                  placeholder="Ví dụ: Một chú rồng con bị sún răng..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                />
                <button 
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white shadow-red-200 shadow-lg' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                  title="Nói để nhập văn bản"
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4">
                  <button
                    onClick={() => {
                        // Surprise Me Logic
                        const randomTheme = STORY_THEMES[Math.floor(Math.random() * STORY_THEMES.length)];
                        const randomPrompt = randomTheme.prompts[Math.floor(Math.random() * randomTheme.prompts.length)];
                        setPromptInput(randomPrompt);
                    }}
                    className="flex-1 py-4 rounded-2xl text-lg font-bold text-pink-500 border-2 border-pink-200 hover:bg-pink-50 transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Shuffle className="w-5 h-5" /> Ngẫu nhiên
                  </button>
                  <button
                    disabled={isCreatingStory || !promptInput.trim()}
                    onClick={() => generateNewStory(promptInput)}
                    className={`flex-[2] py-4 rounded-2xl text-lg font-bold text-white shadow-lg transform transition-all 
                      ${isCreatingStory || !promptInput.trim() 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-pink-500 hover:bg-pink-600 hover:scale-105'}`}
                  >
                    {isCreatingStory ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" /> Đang viết...
                      </span>
                    ) : "Bắt đầu kể chuyện!"}
                  </button>
              </div>
          </div>

          {/* Right Panel: Themes */}
          <div className="w-full md:w-80 bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
             <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">Gợi ý chủ đề</h3>
             <div className="space-y-4">
                {STORY_THEMES.map((theme) => (
                    <div key={theme.id}>
                        <button 
                            onClick={() => setActiveThemeId(activeThemeId === theme.id ? null : theme.id)}
                            className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${activeThemeId === theme.id ? theme.color : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                {theme.icon}
                                <span className="font-bold">{theme.label}</span>
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-transform ${activeThemeId === theme.id ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {/* Prompt Chips */}
                        {activeThemeId === theme.id && (
                            <div className="mt-2 flex flex-wrap gap-2 animate-slide-up pl-2">
                                {theme.prompts.map((prompt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setPromptInput(prompt)}
                                        className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 transition-colors text-left"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    );
  }

  if (view === "games") {
    // Reuse existing logic, just wrapping with DynamicBackground for consistency in menu
    if (activeGame === "menu") {
      return (
        <div className="min-h-screen p-8 bg-violet-50 flex flex-col items-center overflow-auto relative">
           <DynamicBackground />
           {/* ... Header & Grid Logic Copied but wrapped ... */}
           <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-10">
                 <button onClick={() => setView("home")} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 text-violet-500 hover-wobble">
                    <Home className="w-6 h-6" />
                 </button>
                 <h1 className="text-4xl font-bold text-violet-600">Góc Vui Chơi</h1>
                 <div className="w-12"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10 pb-10">
                  <div 
                    onClick={() => setActiveGame("memory")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-violet-200 flex flex-col items-center animate-slide-up"
                  >
                      <Puzzle className="w-16 h-16 text-violet-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Lật Hình</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Rèn luyện trí nhớ</p>
                  </div>
                  {/* ... Rest of game items ... */}
                  <div 
                    onClick={() => setActiveGame("math")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-sky-200 flex flex-col items-center animate-slide-up"
                  >
                      <Calculator className="w-16 h-16 text-sky-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Đố Vui Toán</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Học cộng thật vui</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("shape")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-pink-200 flex flex-col items-center animate-slide-up"
                  >
                      <Shapes className="w-16 h-16 text-pink-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Phân Loại</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Vuông, Tròn, Giác</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("music")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-teal-200 flex flex-col items-center animate-slide-up"
                  >
                      <Music className="w-16 h-16 text-teal-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Nhạc Sĩ Tí Hon</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Chơi đàn Xylophone</p>
                  </div>

                   <div 
                    onClick={() => setActiveGame("mole")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-amber-200 flex flex-col items-center animate-slide-up"
                  >
                      <Rat className="w-16 h-16 text-amber-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Đập Chuột</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Nhanh tay nhanh mắt</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("color")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-indigo-200 flex flex-col items-center animate-slide-up"
                  >
                      <FlaskConical className="w-16 h-16 text-indigo-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Pha Màu</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Học pha trộn màu sắc</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("drawing")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-rose-200 flex flex-col items-center animate-slide-up"
                  >
                      <Pencil className="w-16 h-16 text-rose-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Bé Họa Sĩ</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Thỏa sức sáng tạo</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("jigsaw")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-blue-200 flex flex-col items-center animate-slide-up"
                  >
                      <Grid className="w-16 h-16 text-blue-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Ghép Tranh</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Xếp hình thú vị</p>
                  </div>

                  <div 
                    onClick={() => setActiveGame("word")}
                    className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform border-b-8 border-green-200 flex flex-col items-center animate-slide-up"
                  >
                      <LinkIcon className="w-16 h-16 text-green-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">Nối Từ</h2>
                      <p className="text-sm text-gray-500 mt-2 text-center">Học từ mới qua ảnh</p>
                  </div>
              </div>
        </div>
      )
    }
    // Sub-games don't need dynamic background to avoid distraction, or minimal
    // ... Sub-game return statements remain same but ensure they are wrapped in <div> if needed ...
    // Since I'm replacing the whole component, I will just return the sub-games as they were but with `z-10` relative positioning if needed.
    
    if (activeGame === "memory") return <MemoryGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "math") return <MathQuiz onBack={() => setActiveGame("menu")} />
    if (activeGame === "shape") return <ShapeSorter onBack={() => setActiveGame("menu")} />
    if (activeGame === "music") return <XylophoneGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "mole") return <WhackAMoleGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "color") return <ColorMixingGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "drawing") return <DrawingGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "jigsaw") return <JigsawGame onBack={() => setActiveGame("menu")} />
    if (activeGame === "word") return <WordMatchGame onBack={() => setActiveGame("menu")} />
  }

  // Reading View
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${currentTheme.class} relative overflow-hidden`}>
      <DynamicBackground />
      
      {/* READING MODE OVERLAY */}
      {readingMode && (
          <div className="fixed inset-0 bg-black/90 z-40 animate-fade-in pointer-events-none"></div>
      )}

      {/* Header (Hidden in reading mode, unless hovered? No, let's keep it simple: minimize button floats) */}
      {!readingMode && (
          <header className="p-4 flex items-center justify-between bg-white/50 backdrop-blur-md shadow-sm z-10 sticky top-0 animate-slide-up">
            <button 
              onClick={() => setView("home")}
              className="bg-white hover:bg-gray-100 p-3 rounded-full transition-colors shadow-sm hover-wobble"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className={`text-xl font-bold truncate max-w-[50%] ${currentTheme.text}`}>{currentStory?.title}</h1>
            <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setReadingMode(true)}
                   className="bg-white hover:bg-gray-100 p-3 rounded-full transition-colors shadow-sm text-gray-600 hover-wobble"
                   title="Chế độ đọc"
                >
                   <Maximize className="w-6 h-6" />
                </button>
                <button 
                   onClick={() => setIsSettingsOpen(true)}
                   className="bg-white hover:bg-gray-100 p-3 rounded-full transition-colors shadow-sm text-gray-600 hover-wobble"
                >
                   <Settings className="w-6 h-6" />
                </button>
            </div>
          </header>
      )}

      {/* Reading Mode Exit Button */}
      {readingMode && (
         <button 
           onClick={() => setReadingMode(false)}
           className="fixed top-6 right-6 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors backdrop-blur-md hover:scale-110"
           title="Thoát chế độ đọc"
        >
           <Minimize className="w-8 h-8" />
        </button>
      )}

      {/* Main Content with Page Flip Animation */}
      <main className={`flex-1 flex flex-col items-center justify-center p-4 mx-auto w-full gap-6 transition-all duration-500 z-10 perspective-1500
          ${readingMode ? 'max-w-5xl scale-105 justify-center h-screen py-8' : 'max-w-4xl'}`}>
        
        {/* Book Page Container */}
        <div key={pageIndex} className="w-full flex flex-col gap-6 animate-book-flip origin-left-center transform-style-3d">
            
            {/* Image Area */}
            <div 
              className={`relative w-full aspect-square md:aspect-video rounded-3xl shadow-xl overflow-hidden flex items-center justify-center group
                  ${readingMode ? 'bg-black border-none shadow-2xl' : 'bg-white/50 border-4 border-white/60'}`}
            >
              {assets[pageIndex]?.imageUrl ? (
                <img 
                  src={assets[pageIndex].imageUrl} 
                  alt="Story illustration" 
                  className="w-full h-full object-cover animate-ken-burns" 
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                   <Loader2 className="w-16 h-16 animate-spin mb-4 text-sky-400" />
                   <p className="text-lg font-medium text-gray-400">Đang vẽ tranh...</p>
                </div>
              )}
              
              {/* Page Counter Badge */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold z-10">
                {pageIndex + 1} / {currentStory?.pages.length}
              </div>
            </div>

            {/* Text Area */}
            <div 
              key={`txt-${pageIndex}`}
              className={`w-full rounded-3xl p-6 shadow-sm min-h-[120px] flex items-center justify-center text-center animate-slide-up relative overflow-hidden transition-all
                  ${readingMode 
                      ? 'bg-black/60 backdrop-blur-xl text-white border border-white/10' 
                      : `bg-white/60 backdrop-blur-md border border-white/50 ${currentTheme.text}`}`}
            >
              <p className="text-2xl md:text-3xl leading-relaxed font-medium">
                 {/* Dynamic Story Text Component */}
                 <StoryText 
                    text={currentStory?.pages[pageIndex] || ""} 
                    isPlaying={isPlaying} 
                    progress={audioProgress}
                 />
              </p>

              {!readingMode && (
                <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none opacity-80" aria-hidden="true">
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[20px] border-r-[20px] border-b-black/10 border-r-transparent transform rotate-180"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-[20px] border-l-[20px] border-t-white/80 border-l-transparent shadow-sm"></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className={`w-full flex items-center justify-between gap-4 mt-2 ${readingMode ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
              <button 
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
                className={`p-6 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 hover-wobble
                  ${pageIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-white text-sky-500 hover:bg-sky-50'}`}
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              <button 
                onClick={playCurrentAudio}
                disabled={assets[pageIndex]?.isGeneratingAudio}
                className={`flex-1 max-w-xs py-4 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95
                  ${assets[pageIndex]?.isGeneratingAudio 
                    ? 'bg-gray-200 text-gray-400' 
                    : isPlaying 
                      ? 'bg-orange-400 text-white ring-4 ring-orange-200' 
                      : 'bg-sky-500 text-white hover:bg-sky-600'}
                  ${!assets[pageIndex]?.isGeneratingAudio && !isPlaying ? 'animate-gentle-pulse' : ''}
                `}
              >
                {assets[pageIndex]?.isGeneratingAudio ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isPlaying ? (
                   <Pause className="w-8 h-8 fill-current" />
                ) : (
                   <Volume2 className="w-8 h-8" />
                )}
                <span className="text-xl font-bold">
                  {assets[pageIndex]?.isGeneratingAudio ? "Đang tải giọng..." : isPlaying ? "Dừng đọc" : "Đọc to"}
                </span>
              </button>

              <button 
                onClick={() => setPageIndex(Math.min((currentStory?.pages.length || 0) - 1, pageIndex + 1))}
                disabled={pageIndex === ((currentStory?.pages.length || 0) - 1)}
                className={`p-6 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 hover-wobble
                  ${pageIndex === ((currentStory?.pages.length || 0) - 1) ? 'bg-gray-200 text-gray-400' : 'bg-white text-sky-500 hover:bg-sky-50 animate-nudge-right'}`}
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>

        </div>

      </main>

      <SettingsModal 
         isOpen={isSettingsOpen} 
         onClose={() => setIsSettingsOpen(false)}
         settings={settings}
         onUpdate={setSettings}
      />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);