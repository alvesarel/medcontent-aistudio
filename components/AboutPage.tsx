import React from 'react';
import Logo from './Logo';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-surface p-8 sm:p-12 rounded-xl border border-custom-border text-center shadow-sm">
        <Logo className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-extrabold text-copy-text mt-4">Nossa Missão</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-copy-text-secondary">
          Simplificar a comunicação na saúde, dando aos profissionais a liberdade para focar no que realmente importa: seus pacientes.
        </p>
      </div>

      <div className="mt-12 text-copy-text-secondary leading-loose space-y-6 prose prose-slate max-w-none prose-lg">
        <h2 className="text-3xl font-bold text-copy-text border-b border-custom-border pb-2">A História por Trás da Inovação</h2>
        <p>
          A MedContent AI nasceu de uma necessidade real, sentida na pele (e nas longas noites de plantão) pela Dra. Camila, nossa fundadora. Como médica dedicada, ela se via dividida entre a paixão por cuidar de seus pacientes e a crescente demanda por uma presença digital ativa e profissional.
        </p>
        <p>
          Ela sabia que compartilhar conhecimento online era essencial para educar sua comunidade e fortalecer sua clínica, mas o tempo era um recurso escasso. A criação de conteúdo — pesquisar, escrever, formatar para cada rede social — era um segundo emprego que ela simplesmente não tinha tempo para exercer.
        </p>
        
        <blockquote className="border-l-4 border-primary pl-4 italic text-copy-text">
          "Eu via colegas postando conteúdos incríveis e me perguntava: como eles conseguem? A verdade é que, ou eles tinham uma equipe de marketing, ou sacrificavam seu precioso tempo de descanso. Eu queria uma terceira opção."
        </blockquote>

        <p>
          Apaixonada por tecnologia desde a faculdade, Dra. Camila começou a explorar como a inteligência artificial poderia resolver esse dilema. E se houvesse uma ferramenta que pudesse entender as nuances da comunicação em saúde, pesquisar tendências relevantes e criar posts de alta qualidade, tudo em questão de minutos?
        </p>

        <p>
          Essa pergunta foi o ponto de partida para a MedContent AI. O que começou como um projeto pessoal para automatizar suas próprias publicações rapidamente se transformou em uma plataforma robusta. Dra. Camila uniu-se a especialistas em IA e marketing digital para construir a ferramenta que ela sempre sonhou em ter.
        </p>
        
        <h3 className="text-2xl font-bold text-copy-text border-b border-custom-border pb-2">Nossa Promessa</h3>

        <p>
          Hoje, a MedContent AI é a "terceira opção" que a Dra. Camila buscava. Uma plataforma construída por profissionais da saúde, para profissionais da saúde. Entendemos suas restrições de tempo, suas obrigações éticas e sua paixão por educar. Nossa missão é devolver a você o controle do seu tempo, permitindo que você construa uma presença digital de autoridade sem sacrificar sua qualidade de vida ou o cuidado com seus pacientes.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;