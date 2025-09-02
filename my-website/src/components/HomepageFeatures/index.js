import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
const FeatureList = [
    {
        title: 'Easy to Use',
        Svg: require('@site/static/img/SpeakEasyLogo.svg').default,
        description: (<>
        SpeakEasy SDK handles the OpenAI and RealTime integration for you.
      </>),
    },
    {
        title: 'Audio and Text Integration',
        Svg: require('@site/static/img/SpeakEasyLogo.svg').default,
        description: (<>
        Use the SDK to integrate text and audio automation with your application.
      </>),
    },
    {
        title: 'Usable for all Applications',
        Svg: require('@site/static/img/SpeakEasyLogo.svg').default,
        description: (<>
        The SDK is written in TypeScript but can be used for all applications. Refer to the tutorials for more information.
      </>),
    },
];
function Feature({ title, Svg, description }) {
    return (<div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img"/>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>);
}
export default function HomepageFeatures() {
    return (<section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (<Feature key={idx} {...props}/>))}
        </div>
      </div>
    </section>);
}
