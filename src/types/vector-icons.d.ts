// 添加react-native-vector-icons的类型声明
declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle, ImageStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle | ImageStyle;
  }

  class Icon extends Component<IconProps> {
    static getImageSource(
      name: string,
      size?: number,
      color?: string
    ): Promise<any>;
    static getRawGlyphMap(): { [name: string]: number };
    static loadFont(
      file?: string
    ): Promise<void>;
    static hasIcon(name: string): boolean;
  }

  export = Icon;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Ionicons' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/FontAwesome5' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/AntDesign' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Entypo' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Feather' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Octicons' {
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  export default MaterialCommunityIcons;
} 