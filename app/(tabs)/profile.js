import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Gradients } from '../../constants/theme';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={Gradients.main}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
